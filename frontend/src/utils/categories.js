export const CORE_CATEGORIES = [
  'Food & Snacks',
  'Travel & Transport',
  'Shopping & Clothes',
  'Fun & Gaming',
  'Study & College',
  'Bills & Subscriptions',
  'Personal & Other'
];

export const PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other'
];

export const POPULAR_ITEMS = [
  { name: 'Milk', icon: '🥛', defaultAmount: 1000 },
  { name: 'Daily Tea / Coffee', icon: '☕', defaultAmount: 500 },
  { name: 'Gym / Fitness', icon: '🏋️', defaultAmount: 1200 },
  { name: 'Bus / Metro Pass', icon: '🚌', defaultAmount: 800 },
  { name: 'College Books & Notes', icon: '📚', defaultAmount: 700 },
  { name: 'Mobile Recharge & Wifi', icon: '📶', defaultAmount: 499 },
  { name: 'Hostel / Rent Share', icon: '🏠', defaultAmount: 5000 },
  { name: 'Canteen & Fast Food', icon: '🥪', defaultAmount: 1500 }
];

export const getCategoryIcon = (categoryOrItem) => {
  if (!categoryOrItem) return '💸';
  const name = categoryOrItem.toLowerCase().trim();

  if (name.includes('milk') || name.includes('doodh')) return '🥛';
  if (name.includes('tea') || name.includes('chai') || name.includes('coffee')) return '☕';
  if (name.includes('gym') || name.includes('fitness') || name.includes('workout')) return '🏋️';
  if (name.includes('book') || name.includes('college') || name.includes('study') || name.includes('tuition')) return '📚';
  if (name.includes('bus') || name.includes('metro') || name.includes('travel') || name.includes('uber') || name.includes('transport') || name.includes('petrol') || name.includes('auto')) return '🚕';
  if (name.includes('food') || name.includes('snack') || name.includes('pizza') || name.includes('burger') || name.includes('canteen')) return '🍕';
  if (name.includes('game') || name.includes('gaming') || name.includes('fun') || name.includes('steam')) return '🎮';
  if (name.includes('shop') || name.includes('cloth') || name.includes('dress') || name.includes('shoe')) return '🛍️';
  if (name.includes('bill') || name.includes('recharge') || name.includes('wifi') || name.includes('subscript') || name.includes('netflix') || name.includes('spotify')) return '📱';
  if (name.includes('rent') || name.includes('room') || name.includes('hostel')) return '🏠';
  if (name.includes('health') || name.includes('med') || name.includes('doctor')) return '💊';

  return '📦';
};
