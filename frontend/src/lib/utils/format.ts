/**
 * Formatting utility functions for ChaiTrade
 */

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format number with Indian numbering system (lakhs, crores)
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format Ethereum/wallet address to shortened version
 */
export function formatAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
}

/**
 * Format date to human-readable format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date and time to human-readable format
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (Math.abs(diffSec) < 60) return 'just now';
  if (Math.abs(diffMin) < 60) return `${Math.abs(diffMin)} minute${Math.abs(diffMin) !== 1 ? 's' : ''} ${diffMs < 0 ? 'ago' : 'from now'}`;
  if (Math.abs(diffHour) < 24) return `${Math.abs(diffHour)} hour${Math.abs(diffHour) !== 1 ? 's' : ''} ${diffMs < 0 ? 'ago' : 'from now'}`;
  if (Math.abs(diffDay) < 30) return `${Math.abs(diffDay)} day${Math.abs(diffDay) !== 1 ? 's' : ''} ${diffMs < 0 ? 'ago' : 'from now'}`;

  return formatDate(d);
}

/**
 * Format days until due (e.g., "5 days remaining", "2 days overdue")
 */
export function formatDaysUntilDue(dueDate: Date | string): string {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
  } else if (diffDays === 0) {
    return 'Due today';
  } else if (diffDays === 1) {
    return 'Due tomorrow';
  } else {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
  }
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format IPFS CID to shortened version
 */
export function formatIPFSCID(cid: string, chars: number = 15): string {
  if (!cid) return '';
  if (cid.length <= chars * 2) return cid;
  return `${cid.substring(0, chars)}...${cid.substring(cid.length - chars)}`;
}

/**
 * Format transaction hash to shortened version
 */
export function formatTxHash(hash: string, startChars: number = 10, endChars: number = 8): string {
  if (!hash) return '';
  if (hash.length <= startChars + endChars) return hash;
  return `${hash.substring(0, startChars)}...${hash.substring(hash.length - endChars)}`;
}

/**
 * Format large numbers with suffixes (K, M, B)
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e7) return `${(num / 1e7).toFixed(1)} Cr`; // Crore
  if (num >= 1e5) return `${(num / 1e5).toFixed(1)} L`; // Lakh
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
}

/**
 * Format interest rate
 */
export function formatInterestRate(rate: number): string {
  return `${rate.toFixed(2)}% APR`;
}
