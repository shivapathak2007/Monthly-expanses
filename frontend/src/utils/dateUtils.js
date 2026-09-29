/**
 * Format a date string into a friendly readable format
 * e.g., "28 Sep 2026" or "Today" or "Yesterday"
 */
export const formatDateFriendly = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const today = new Date();

  // Reset times for date-only comparison
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Get standard ISO YYYY-MM-DD for date inputs
 */
export const getTodayISO = () => {
  return new Date().toISOString().split('T')[0];
};
