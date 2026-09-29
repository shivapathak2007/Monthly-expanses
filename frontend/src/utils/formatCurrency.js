/**
 * Format currency with proper Indian / International numbering system
 * @param {number} amount - Numerical amount
 * @param {string} currency - 'INR', 'USD', 'EUR', 'GBP'
 * @returns {string} Formatted currency string (e.g., ₹1,25,000)
 */
export const formatCurrency = (amount, currency = 'INR') => {
  const numericAmount = Number(amount) || 0;

  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(numericAmount);
  }

  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(numericAmount);
  }

  if (currency === 'EUR') {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(numericAmount);
  }

  if (currency === 'GBP') {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(numericAmount);
  }

  return `₹${numericAmount.toLocaleString('en-IN')}`;
};

export default formatCurrency;
