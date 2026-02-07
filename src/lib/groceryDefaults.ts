export const CATEGORIES = [
  'Dairy',
  'Produce',
  'Bakery',
  'Meat & Seafood',
  'Frozen',
  'Beverages',
  'Canned Goods',
  'Snacks',
  'Condiments',
  'Grains & Pasta',
  'Other',
] as const;

export type Category = typeof CATEGORIES[number];

export const UNITS = ['item', 'lb', 'oz', 'kg', 'g', 'L', 'mL', 'gallon', 'pack', 'dozen', 'bunch'] as const;

// Smart expiry defaults: item name pattern -> days until expiry
const EXPIRY_RULES: { pattern: RegExp; days: number; category: Category }[] = [
  // Dairy
  { pattern: /milk/i, days: 7, category: 'Dairy' },
  { pattern: /yogurt|yoghurt/i, days: 10, category: 'Dairy' },
  { pattern: /cream cheese/i, days: 14, category: 'Dairy' },
  { pattern: /cheese/i, days: 21, category: 'Dairy' },
  { pattern: /butter/i, days: 30, category: 'Dairy' },
  { pattern: /cream/i, days: 7, category: 'Dairy' },
  { pattern: /eggs?/i, days: 21, category: 'Dairy' },

  // Produce
  { pattern: /spinach|lettuce|arugula|kale/i, days: 3, category: 'Produce' },
  { pattern: /berries|strawberr|blueberr|raspberr/i, days: 4, category: 'Produce' },
  { pattern: /avocado/i, days: 4, category: 'Produce' },
  { pattern: /banana/i, days: 5, category: 'Produce' },
  { pattern: /tomato/i, days: 5, category: 'Produce' },
  { pattern: /cucumber/i, days: 5, category: 'Produce' },
  { pattern: /pepper/i, days: 7, category: 'Produce' },
  { pattern: /broccoli|cauliflower/i, days: 5, category: 'Produce' },
  { pattern: /carrot/i, days: 14, category: 'Produce' },
  { pattern: /apple/i, days: 14, category: 'Produce' },
  { pattern: /orange|lemon|lime|citrus/i, days: 14, category: 'Produce' },
  { pattern: /potato|sweet potato/i, days: 21, category: 'Produce' },
  { pattern: /onion/i, days: 30, category: 'Produce' },
  { pattern: /garlic/i, days: 30, category: 'Produce' },

  // Bakery
  { pattern: /bread/i, days: 5, category: 'Bakery' },
  { pattern: /bagel/i, days: 5, category: 'Bakery' },
  { pattern: /tortilla/i, days: 7, category: 'Bakery' },
  { pattern: /muffin|croissant|pastry/i, days: 3, category: 'Bakery' },

  // Meat & Seafood
  { pattern: /chicken/i, days: 2, category: 'Meat & Seafood' },
  { pattern: /beef|steak|ground beef/i, days: 3, category: 'Meat & Seafood' },
  { pattern: /pork/i, days: 3, category: 'Meat & Seafood' },
  { pattern: /fish|salmon|tuna|shrimp/i, days: 2, category: 'Meat & Seafood' },
  { pattern: /deli|ham|turkey/i, days: 5, category: 'Meat & Seafood' },
  { pattern: /bacon|sausage/i, days: 7, category: 'Meat & Seafood' },

  // Beverages
  { pattern: /juice/i, days: 7, category: 'Beverages' },

  // Condiments
  { pattern: /salsa/i, days: 7, category: 'Condiments' },
  { pattern: /hummus/i, days: 7, category: 'Condiments' },
];

export function getSmartExpiry(itemName: string): { days: number; category: Category } | null {
  for (const rule of EXPIRY_RULES) {
    if (rule.pattern.test(itemName)) {
      return { days: rule.days, category: rule.category };
    }
  }
  return null;
}

export function getExpiryStatus(expiryDate: Date): 'urgent' | 'warning' | 'stable' {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 2) return 'urgent';
  if (diffDays <= 5) return 'warning';
  return 'stable';
}

export function getDaysRemaining(expiryDate: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
