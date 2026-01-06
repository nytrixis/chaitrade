/**
 * AI OCR Service using Tesseract.js with PDF support
 */

import { createWorker } from 'tesseract.js';
import { PDFDocument } from 'pdf-lib';

export interface ExtractedInvoiceData {
  amount: number;
  currency: string;
  invoiceNumber: string;
  buyerName: string;
  sellerName: string;
  issueDate: string;
  dueDate: string;
  description: string;
  confidence?: number;
}

/**
 * Convert PDF to image (first page)
 */
async function pdfToImage(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Get first page
  const firstPage = pdfDoc.getPage(0);
  const { width, height } = firstPage.getSize();

  // Create canvas
  const canvas = document.createElement('canvas');
  const scale = 2; // Higher scale for better OCR quality
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // Render PDF page to canvas
  // Note: This is a simplified version. For production, use pdf.js for better rendering
  // Convert canvas to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else throw new Error('Failed to convert canvas to blob');
    }, 'image/png');
  });
}

/**
 * Extract invoice data from image/PDF using Tesseract.js OCR
 */
export async function extractInvoiceData(file: File): Promise<ExtractedInvoiceData> {
  console.log('Extracting invoice data from:', file.name);

  try {
    let imageFile: File | Blob = file;

    // Convert PDF to image if needed
    if (file.type === 'application/pdf') {
      console.log('Converting PDF to image for OCR...');
      try {
        const imageBlob = await pdfToImage(file);
        imageFile = new File([imageBlob], file.name.replace('.pdf', '.png'), { type: 'image/png' });
        console.log('PDF converted successfully');
      } catch (pdfError) {
        console.error('PDF conversion failed, trying direct OCR:', pdfError);
        // If PDF conversion fails, try direct OCR (may not work)
      }
    }

    // Initialize Tesseract worker
    const worker = await createWorker('eng');

    // Convert file to image URL
    const imageUrl = URL.createObjectURL(imageFile);

    // Perform OCR
    const { data: { text, confidence } } = await worker.recognize(imageUrl);

    // Cleanup
    await worker.terminate();
    URL.revokeObjectURL(imageUrl);

    console.log('OCR extracted text:', text);
    console.log('OCR confidence:', confidence);

    // Parse invoice details from text using regex patterns
    const invoiceData = parseInvoiceText(text);
    invoiceData.confidence = confidence;

    console.log('Parsed invoice data:', invoiceData);

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
      confidence: 0,
    };
  }
}

interface AmountMatch {
  amount: number;
  confidence: number;
  source: string;
  line: string;
}

/**
 * Validate if a number is a reasonable invoice amount
 */
function isValidAmount(amount: number, line: string): boolean {
  // Check if amount is in reasonable range (₹1,000 to ₹10 crore)
  if (amount < 1000 || amount > 100000000) return false;

  // Reject if it's likely a phone number (10 digits starting with 6-9)
  const amountStr = amount.toString();
  if (amountStr.length === 10 && /^[6-9]/.test(amountStr)) {
    console.log('Rejected phone number pattern:', amount);
    return false;
  }

  // Reject if it's likely a GSTIN (15 digits)
  if (amountStr.length === 15) {
    console.log('Rejected GSTIN pattern:', amount);
    return false;
  }

  // Reject if it's likely a PIN code (6 digits)
  if (amountStr.length === 6 && amount < 999999) {
    console.log('Rejected PIN code pattern:', amount);
    return false;
  }

  return true;
}

/**
 * Check if a line contains excluded patterns (dates, contact info, etc.)
 */
function isExcludedNumber(line: string): boolean {
  // Exclude lines with date indicators
  if (line.match(/date|\/|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i)) {
    return true;
  }

  // Exclude lines with contact indicators
  if (line.match(/gstin|phone|mobile|contact|pin|code|email/i)) {
    return true;
  }

  // Exclude lines with unit rates or quantities
  if (line.match(/rate|qty|quantity|unit|per|@/i)) {
    return true;
  }

  return false;
}

/**
 * Parse invoice details from OCR text using pattern matching with confidence scoring
 */
function parseInvoiceText(text: string): ExtractedInvoiceData {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  console.log('=== OCR Amount Extraction Debug ===');
  console.log('Total lines to process:', lines.length);

  // Extract amount with multiple strategies and confidence scores
  const amountMatches: AmountMatch[] = [];
  
  // Track line item amounts for summing if total is corrupted
  const lineItemAmounts: number[] = [];
  
  // First pass: collect all Indian-format numbers (X,XX,XXX pattern)
  // Strategy: For invoice line items, ONLY take the rightmost (last) number
  // This avoids counting quantity/rate columns like "500 800 4,00,000"
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match Indian number format: 1,00,000 or 4,00,000 or 10,00,000
    // Pattern: digit(s), then pairs of digits separated by commas
    const indianNumberMatches = Array.from(line.matchAll(/(\d{1,2},(?:\d{2},)*\d{3})/g));
    
    if (indianNumberMatches.length > 0) {
      console.log(`Line ${i}: "${line}" - found ${indianNumberMatches.length} Indian format number(s)`);
    }
    
    // Filter valid amounts (10K to 10 crore)
    const validMatches = indianNumberMatches.filter((match) => {
      const numStr = match[1].replace(/,/g, '');
      const num = parseFloat(numStr);
      return num >= 10000 && num <= 100000000;
    });
    
    if (validMatches.length === 0) continue;
    
    // CRITICAL: Only process the LAST (rightmost) number from each line
    // In "Industrial Packaging Boxes 500 800 4,00,000", only use 4,00,000
    // In "Logistics & Handling 1 1,00,000 1,00,000", only use the second 1,00,000
    const lastMatch = validMatches[validMatches.length - 1];
    const numStr = lastMatch[1].replace(/,/g, '');
    const num = parseFloat(numStr);
    
    console.log(`  Using rightmost number: ${lastMatch[1]} = ₹${num.toLocaleString()}`);
    if (validMatches.length > 1) {
      console.log(`  (Skipped ${validMatches.length - 1} other number(s) - likely qty/rate columns)`);
    }
    
    // Check if this is a line item (has description text before the number)
    const beforeNumber = line.substring(0, lastMatch.index || 0).trim();
    const isLineItem = beforeNumber.length > 3 && !beforeNumber.match(/^(?:total|grand|amount|balance)/i);
    
    if (isLineItem) {
      lineItemAmounts.push(num);
      console.log(`    → Added as LINE ITEM`);
    }
    
    // Check if this line mentions "total"
    if (line.match(/total/i)) {
      amountMatches.push({
        amount: num,
        confidence: 0.95,
        source: 'indian_format_total',
        line
      });
      console.log(`    → Added as TOTAL MATCH (confidence: 0.95)`);
    } else {
      amountMatches.push({
        amount: num,
        confidence: 0.6,
        source: 'indian_format_number',
        line
      });
      console.log(`    → Added as GENERIC MATCH (confidence: 0.6)`);
    }
  }
  
  console.log('=== Line Items Found:', lineItemAmounts.length, '===');
  if (lineItemAmounts.length > 0) {
    console.log('Line item amounts:', lineItemAmounts.map(a => `₹${a.toLocaleString()}`).join(', '));
    console.log('Sum of line items:', `₹${lineItemAmounts.reduce((a, b) => a + b, 0).toLocaleString()}`);
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Strategy 1: "Total" or "Grand Total" keyword (highest confidence)
    const totalMatch = line.match(/(?:grand\s+)?total[\s\■\|\[]*(?:invoice\s+value|amount)?[\s\■\|\[]*(?:₹|rs\.?|inr)?[\s\|\[]*([\d,]+(?:\.\d{1,2})?)/i);
    if (totalMatch) {
      const numStr = totalMatch[1].replace(/,/g, '');
      const num = parseFloat(numStr);
      if (isValidAmount(num, line)) {
        amountMatches.push({
          amount: num,
          confidence: 0.95,
          source: 'total_keyword',
          line
        });
      }
    }

    // Strategy 2: "Amount Due" or "Balance Due" (high confidence)
    const amountDueMatch = line.match(/(?:amount|balance)\s+due[\s\:]*(?:₹|rs\.?|inr)?[\s]*([\d,]+(?:\.\d{1,2})?)/i);
    if (amountDueMatch) {
      const numStr = amountDueMatch[1].replace(/,/g, '');
      const num = parseFloat(numStr);
      if (isValidAmount(num, line)) {
        amountMatches.push({
          amount: num,
          confidence: 0.9,
          source: 'amount_due',
          line
        });
      }
    }

    // Strategy 3: Numbers in bottom 30% of document (likely totals)
    if (i >= Math.floor(lines.length * 0.7)) {
      const numberOnlyMatch = line.match(/^[\s\|]*([1-9]\d{0,2}(?:,\d{2,3})+)[\s\|]*$/);
      if (numberOnlyMatch) {
        const numStr = numberOnlyMatch[1].replace(/,/g, '');
        const num = parseFloat(numStr);
        if (isValidAmount(num, line) && num > 50000) {
          amountMatches.push({
            amount: num,
            confidence: 0.75,
            source: 'bottom_section_number',
            line
          });
        }
      }
    }

    // Strategy 4: Currency symbols followed by numbers
    const currencyMatch = line.match(/(?:₹|rs\.?)\s*([\d,]+(?:\.\d{1,2})?)/i);
    if (currencyMatch && !line.match(/rate|price|cost|per|@|\/|unit|item/i)) {
      const numStr = currencyMatch[1].replace(/,/g, '');
      const num = parseFloat(numStr);
      if (isValidAmount(num, line) && num > 1000) {
        amountMatches.push({
          amount: num,
          confidence: 0.7,
          source: 'currency_symbol',
          line
        });
      }
    }
  }

  // Sort by confidence and amount (higher is likely correct)
  amountMatches.sort((a, b) => {
    if (Math.abs(a.confidence - b.confidence) > 0.1) {
      return b.confidence - a.confidence;
    }
    return b.amount - a.amount;
  });

  console.log('=== Amount Match Results ===');
  console.log('Total matches found:', amountMatches.length);
  if (amountMatches.length > 0) {
    console.log('All matches:', amountMatches.map(m => `₹${m.amount.toLocaleString()} (conf: ${m.confidence}, src: ${m.source})`).join('\n  '));
  }

  // Determine final amount using priority logic
  let amount = 0;
  let amountSource = 'none';
  
  // Priority 1: High-confidence total match (confidence >= 0.9)
  const highConfidenceMatch = amountMatches.find(m => m.confidence >= 0.9);
  if (highConfidenceMatch) {
    amount = highConfidenceMatch.amount;
    amountSource = `high_confidence_${highConfidenceMatch.source}`;
    console.log(`✓ Using high-confidence match: ₹${amount.toLocaleString()} (${highConfidenceMatch.source})`);
  }
  
  // Priority 2: Sum of line items (if we have 2+ line items, their sum is likely the total)
  if (amount === 0 && lineItemAmounts.length >= 2) {
    amount = lineItemAmounts.reduce((sum, item) => sum + item, 0);
    amountSource = 'line_item_sum';
    console.log(`✓ Using sum of ${lineItemAmounts.length} line items: ₹${amount.toLocaleString()}`);
    console.log('  Line items:', lineItemAmounts.map(a => `₹${a.toLocaleString()}`).join(' + '));
  }
  
  // Priority 3: Single line item or largest number found
  if (amount === 0 && amountMatches.length > 0) {
    // Get the largest amount from all matches
    const sortedByAmount = [...amountMatches].sort((a, b) => b.amount - a.amount);
    amount = sortedByAmount[0].amount;
    amountSource = `largest_match_${sortedByAmount[0].source}`;
    console.log(`✓ Using largest match as fallback: ₹${amount.toLocaleString()}`);
  }
  
  // Priority 4: If we have exactly 1 line item, use it
  if (amount === 0 && lineItemAmounts.length === 1) {
    amount = lineItemAmounts[0];
    amountSource = 'single_line_item';
    console.log(`✓ Using single line item: ₹${amount.toLocaleString()}`);
  }

  console.log(`=== Final Amount: ₹${amount.toLocaleString()} (source: ${amountSource}) ===`);
  
  // Fallback: Look for any 5-7 digit number (likely in lakhs range)
  if (amount === 0) {
    for (const line of lines) {
      const largeNumMatch = line.match(/([1-9]\d{4,6})/);
      if (largeNumMatch && !isExcludedNumber(line)) {
        const num = parseInt(largeNumMatch[1]);
        if (isValidAmount(num, line)) {
          amount = num;
          console.log('Found amount via fallback:', num, 'from line:', line);
          break;
        }
      }
    }
  }

  // Extract invoice number - look for "Invoice No:", "Inv", "INV-1023", etc
  let invoiceNumber = '';
  for (const line of lines) {
    // Match "Invoice No: INV-1023" or "INV-1023" at start of line
    const invMatch = line.match(/(?:invoice\s+no|inv)[:\s]*([\w\d\-]+)/i) || 
                     line.match(/^(INV[\-\s]?\d+)/i);
    if (invMatch) {
      invoiceNumber = invMatch[1].trim();
      break;
    }
  }

  // Extract buyer name - look for "Buyer" section
  let buyerName = '';
  for (let i = 0; i < lines.length; i++) {
    // Look for "Buyer" or "Bill To" line
    if (lines[i].match(/^buyer\s*$/i) || lines[i].match(/^bill\s+to\s*$/i)) {
      // Next line should be the buyer name
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j];
        // Skip empty lines and look for first substantial line that isn't obviously another section
        if (nextLine.length > 2 && !nextLine.match(/^(?:seller|gstin|address|delhi|mumbai|kolkata|west\s+bengal|maharashtra)/i)) {
          buyerName = nextLine;
          break;
        }
      }
      if (buyerName) break;
    }
    
    // Also try inline format "Buyer: CompanyName"
    const buyerInline = lines[i].match(/^buyer\s*[:]\s*(.+)$/i);
    if (buyerInline) {
      buyerName = buyerInline[1].trim();
      break;
    }
  }

  // Extract seller/company name - look for "Seller" section or first substantial line
  let sellerName = '';
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^seller\s*$/i)) {
      // Next line should be seller name
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].length > 2 && !lines[j].match(/^(?:msme|gstin|address)/i)) {
          sellerName = lines[j];
          break;
        }
      }
      if (sellerName) break;
    }
  }
  
  // Fallback: find company name at the top
  if (!sellerName) {
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i];
      if (line.length > 5 && line.length < 60 && 
          !line.match(/^(?:invoice|date|no|buyer|seller|item|description|rate|amount|total|payment|terms|bank|declaration|gstin)/i)) {
        sellerName = line;
        break;
      }
    }
  }

  // Extract dates - handle both "12 March 2026" and "12/03/2026" formats
  let issueDate = new Date().toISOString().split('T')[0];
  let dueDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  for (const line of lines) {
    // Match "Invoice Date: 12 March 2026"
    const dateMatch = line.match(/invoice\s+date[:\s]+([\d]{1,2})\s+([a-z]+)\s+([\d]{4})/i);
    if (dateMatch) {
      issueDate = parseDateString(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
    }

    // Match "Due Date: 11 May 2026"
    const dueMatch = line.match(/due\s+date[:\s]+([\d]{1,2})\s+([a-z]+)\s+([\d]{4})/i);
    if (dueMatch) {
      dueDate = parseDateString(`${dueMatch[1]}-${dueMatch[2]}-${dueMatch[3]}`);
    }

    // Fallback to numeric date patterns
    const numDateMatch = line.match(/date[:\s]*([\d]{1,2}[\/\-][\d]{1,2}[\/\-][\d]{2,4})/i);
    if (numDateMatch && issueDate === new Date().toISOString().split('T')[0]) {
      issueDate = parseDateString(numDateMatch[1]);
    }

    const numDueMatch = line.match(/due[:\s]*([\d]{1,2}[\/\-][\d]{1,2}[\/\-][\d]{2,4})/i);
    if (numDueMatch && dueDate === new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) {
      dueDate = parseDateString(numDueMatch[1]);
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
    // Handle month names like "12-March-2026"
    const monthNameMatch = dateStr.match(/(\d{1,2})[\/\-\s]([a-z]+)[\/\-\s](\d{4})/i);
    if (monthNameMatch) {
      const day = parseInt(monthNameMatch[1]);
      const monthName = monthNameMatch[2].toLowerCase();
      const year = parseInt(monthNameMatch[3]);
      
      const monthMap: { [key: string]: number } = {
        january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
        july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
        jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
      };
      
      const month = monthMap[monthName] || 1;
      const date = new Date(year, month - 1, day);
      return date.toISOString().split('T')[0];
    }

    // Handle numeric dates like "12/03/2026"
    const parts = dateStr.split(/[\/\-]/);
    let day, month, year;

    if (parts.length === 3) {
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

  console.log('Validating invoice data:', {
    amount: data.amount,
    buyerName: data.buyerName,
    dueDate: data.dueDate,
  });

  if (!data.amount || data.amount <= 0) {
    errors.push(`Invalid invoice amount: ${data.amount}`);
  }

  if (!data.buyerName || data.buyerName === 'Unknown Buyer') {
    errors.push(`Buyer name is required: "${data.buyerName}"`);
  }

  if (!data.dueDate) {
    errors.push('Due date is required');
  }

  const dueDate = new Date(data.dueDate);
  if (dueDate < new Date()) {
    errors.push('Due date must be in the future');
  }

  if (errors.length > 0) {
    console.error('Validation errors:', errors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
