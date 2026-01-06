/**
 * Validation utility functions for ChaiTrade
 */

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate invoice amount
 */
export function isValidInvoiceAmount(amount: number): { valid: boolean; error?: string } {
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }

  if (amount < 1000) {
    return { valid: false, error: 'Minimum invoice amount is ₹1,000' };
  }

  if (amount > 100000000) {
    return { valid: false, error: 'Maximum invoice amount is ₹10 Crore' };
  }

  return { valid: true };
}

/**
 * Validate due date
 */
export function isValidDueDate(dueDate: Date | string): { valid: boolean; error?: string } {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const now = new Date();

  if (isNaN(due.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }

  if (due <= now) {
    return { valid: false, error: 'Due date must be in the future' };
  }

  // Maximum due date: 1 year from now
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  if (due > maxDate) {
    return { valid: false, error: 'Due date cannot be more than 1 year in the future' };
  }

  return { valid: true };
}

/**
 * Validate credit score
 */
export function isValidCreditScore(score: number): boolean {
  return score >= 300 && score <= 900;
}

/**
 * Validate interest rate (basis points)
 */
export function isValidInterestRate(rate: number): { valid: boolean; error?: string } {
  if (isNaN(rate) || rate < 0) {
    return { valid: false, error: 'Interest rate must be non-negative' };
  }

  if (rate > 50) {
    return { valid: false, error: 'Interest rate cannot exceed 50%' };
  }

  return { valid: true };
}

/**
 * Validate investment amount
 */
export function isValidInvestmentAmount(
  amount: number,
  invoiceAmount: number,
  currentlyFunded: number
): { valid: boolean; error?: string } {
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'Investment amount must be greater than 0' };
  }

  // Minimum investment: 0.001 AVAX for testnet (≈₹3)
  if (amount < 0.001) {
    return { valid: false, error: 'Minimum investment amount is 0.001 AVAX' };
  }

  const remaining = invoiceAmount - currentlyFunded;
  if (amount > remaining) {
    return { valid: false, error: `Investment exceeds remaining amount (₹${remaining.toLocaleString()})` };
  }

  return { valid: true };
}

/**
 * Validate buyer name
 */
export function isValidBuyerName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Buyer name is required' };
  }

  if (name.length < 3) {
    return { valid: false, error: 'Buyer name must be at least 3 characters' };
  }

  if (name.length > 100) {
    return { valid: false, error: 'Buyer name cannot exceed 100 characters' };
  }

  return { valid: true };
}

/**
 * Validate IPFS CID format
 */
export function isValidIPFSCID(cid: string): boolean {
  if (!cid) return false;
  // Basic validation for IPFS CIDv0 (Qm...) and CIDv1 (ba...)
  return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|ba[A-Za-z2-7]{57})$/.test(cid);
}

/**
 * Validate invoice number format
 */
export function isValidInvoiceNumber(number: string): { valid: boolean; error?: string } {
  if (!number || number.trim().length === 0) {
    return { valid: true }; // Optional field
  }

  if (number.length > 50) {
    return { valid: false, error: 'Invoice number cannot exceed 50 characters' };
  }

  return { valid: true };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Indian format)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Accepts formats: +91XXXXXXXXXX, 91XXXXXXXXXX, XXXXXXXXXX
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate GST number (Indian)
 */
export function isValidGSTNumber(gst: string): boolean {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst.toUpperCase());
}

/**
 * Check if a date is in the past
 */
export function isDateInPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
}

/**
 * Check if a date is in the future
 */
export function isDateInFuture(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d > new Date();
}

/**
 * Validate that a number is within a range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}
