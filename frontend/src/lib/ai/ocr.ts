/**
 * AI OCR Service using Tesseract.js
 */

import { createWorker } from 'tesseract.js';

export interface ExtractedInvoiceData {
  amount: number;
  currency: string;
  invoiceNumber: string;
  buyerName: string;
  sellerName: string;
  issueDate: string;
  dueDate: string;
  description: string;
}

/**
 * Extract invoice data from image/PDF using Tesseract.js OCR
 */
export async function extractInvoiceData(file: File): Promise<ExtractedInvoiceData> {
  console.log('Extracting invoice data from:', file.name);

  try {
    // Initialize Tesseract worker
    const worker = await createWorker('eng');

    // Convert file to image URL
    const imageUrl = URL.createObjectURL(file);

    // Perform OCR
    const { data: { text } } = await worker.recognize(imageUrl);

    // Cleanup
    await worker.terminate();
    URL.revokeObjectURL(imageUrl);

    console.log('OCR extracted text:', text);

    // Parse invoice details from text using regex patterns
    const invoiceData = parseInvoiceText(text);

    return invoiceData;
  } catch (error) {
    console.error('OCR extraction error:', error);

    // Fallback: return empty structure that user can fill manually
    return {
      amount: 0,
      currency: 'INR',
      invoiceNumber: '',
      buyerName: '',
      sellerName: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Invoice extracted from ' + file.name,
    };
  }
}

/**
 * Parse invoice details from OCR text using pattern matching
 */
function parseInvoiceText(text: string): ExtractedInvoiceData {
  const lines = text.split('\n').map(l => l.trim());

  // Extract amount - look for patterns like ₹5000, 5,000.00, Rs. 5000, Total: 5000
  let amount = 0;
  const amountPatterns = [
    /(?:total|amount|grand\s+total)[:\s]*(?:₹|rs\.?|inr)?\s*([\d,]+\.?\d*)/i,
    /(?:₹|rs\.?)\s*([\d,]+\.?\d*)/i,
    /([\d,]+\.?\d*)\s*(?:₹|rs\.?|inr)/i,
  ];

  for (const pattern of amountPatterns) {
    for (const line of lines) {
      const match = line.match(pattern);
      if (match) {
        const numStr = match[1].replace(/,/g, '');
        const num = parseFloat(numStr);
        if (num > amount && num < 100000000) {
          amount = num;
        }
      }
    }
  }

  // Extract invoice number
  let invoiceNumber = '';
  const invoicePatterns = [
    /invoice\s+(?:no|number|#)[:\s]*([\w\d-]+)/i,
    /inv[:\s]*([\w\d-]+)/i,
  ];

  for (const pattern of invoicePatterns) {
    for (const line of lines) {
      const match = line.match(pattern);
      if (match) {
        invoiceNumber = match[1];
        break;
      }
    }
    if (invoiceNumber) break;
  }

  // Extract buyer name - look for "To:", "Bill To:", "Customer:", etc
  let buyerName = '';
  const buyerPatterns = [
    /(?:to|bill\s+to|customer|buyer)[:\s]+([a-z\s&.-]+)/i,
  ];

  for (const pattern of buyerPatterns) {
    for (const line of lines) {
      const match = line.match(pattern);
      if (match) {
        buyerName = match[1].trim();
        break;
      }
    }
    if (buyerName) break;
  }

  // Extract seller/company name - usually at the top
  let sellerName = '';
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (lines[i].length > 3 && lines[i].length < 50 && !lines[i].match(/invoice|date|no\./i)) {
      sellerName = lines[i];
      break;
    }
  }

  // Extract dates
  let issueDate = new Date().toISOString().split('T')[0];
  let dueDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const datePatterns = [
    /date[:\s]*([\d]{1,2}[\/\-][\d]{1,2}[\/\-][\d]{2,4})/i,
    /due[:\s]*([\d]{1,2}[\/\-][\d]{1,2}[\/\-][\d]{2,4})/i,
  ];

  for (const line of lines) {
    const dateMatch = line.match(datePatterns[0]);
    if (dateMatch) {
      issueDate = parseDateString(dateMatch[1]);
    }

    const dueMatch = line.match(datePatterns[1]);
    if (dueMatch) {
      dueDate = parseDateString(dueMatch[1]);
    }
  }

  return {
    amount,
    currency: 'INR',
    invoiceNumber: invoiceNumber || `INV-${Date.now()}`,
    buyerName: buyerName || 'Unknown Buyer',
    sellerName: sellerName || 'Unknown Seller',
    issueDate,
    dueDate,
    description: `Invoice ${invoiceNumber || 'extracted'}`,
  };
}

/**
 * Parse date string to ISO format
 */
function parseDateString(dateStr: string): string {
  try {
    const parts = dateStr.split(/[\/\-]/);
    let day, month, year;

    if (parts.length === 3) {
      // Assume DD/MM/YYYY or MM/DD/YYYY
      day = parseInt(parts[0]);
      month = parseInt(parts[1]);
      year = parseInt(parts[2]);

      // Fix 2-digit year
      if (year < 100) {
        year += 2000;
      }

      // Swap if day > 12 (likely MM/DD format)
      if (day > 12) {
        [day, month] = [month, day];
      }

      const date = new Date(year, month - 1, day);
      return date.toISOString().split('T')[0];
    }
  } catch (error) {
    console.error('Date parsing error:', error);
  }

  return new Date().toISOString().split('T')[0];
}

/**
 * Validate extracted invoice data
 */
export function validateInvoiceData(data: ExtractedInvoiceData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.amount || data.amount <= 0) {
    errors.push('Invalid invoice amount');
  }

  if (!data.buyerName) {
    errors.push('Buyer name is required');
  }

  if (!data.dueDate) {
    errors.push('Due date is required');
  }

  const dueDate = new Date(data.dueDate);
  if (dueDate < new Date()) {
    errors.push('Due date must be in the future');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
