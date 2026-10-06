export type PrintStation = 'kot' | 'bot';

type PrintableCategory = {
  category?: string | null;
  name?: string | null;
  parentCategory?: {
    category?: string | null;
    name?: string | null;
  } | null;
};

type PrintableOrderItem = {
  menuItem?: {
    category?: PrintableCategory | null;
    subCategory?: { name?: string | null } | null;
  } | null;
};

const DRINK_NAME =
  /\b(drink|drinks|beverage|beverages|bar|wine|beer|cocktail|spirit|spirits|alcohol|liquor|juice|soda|mocktail|champagne|whisky|whiskey|vodka|gin|rum)\b/i;

function categoryType(value?: string | null) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

export function getPrintStation(
  item: PrintableOrderItem,
): PrintStation | null {
  const cat = item.menuItem?.category;
  const type = categoryType(cat?.category);
  const parentType = categoryType(cat?.parentCategory?.category);
  const names = [
    cat?.name,
    cat?.parentCategory?.name,
    item.menuItem?.subCategory?.name,
  ]
    .filter(Boolean)
    .join(' ');

  if (type === 'drink' || parentType === 'drink' || DRINK_NAME.test(names)) {
    return 'bot';
  }
  if (type === 'food' || parentType === 'food') {
    return 'kot';
  }
  return null;
}

export function isFoodPrintItem(item: PrintableOrderItem) {
  return getPrintStation(item) === 'kot';
}

export function isDrinkPrintItem(item: PrintableOrderItem) {
  return getPrintStation(item) === 'bot';
}
