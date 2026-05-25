import type { ItemCategory } from './types';

const CATEGORY_PREFIX: Record<ItemCategory, string> = {
  camera: 'CAM',
  lens: 'LNS',
  accessory: 'ACC',
  lighting: 'LGT',
  drone: 'DRN',
  stabilizer: 'STB',
  support: 'SUP',
  other: 'OTH',
};

function findNextNumber(existingNumbers: number[]): number {
  const set = new Set(existingNumbers);
  let n = 1;
  while (set.has(n)) n++;
  return n;
}

function parseSuffix(code: string, prefix: string): number | null {
  if (!code.startsWith(prefix + '-')) return null;
  const num = parseInt(code.slice(prefix.length + 1), 10);
  return isNaN(num) ? null : num;
}

export function generateItemSKU(
  existingSkus: string[],
  category: ItemCategory
): string {
  const prefix = CATEGORY_PREFIX[category];
  const numbers = existingSkus
    .map((s) => parseSuffix(s, prefix))
    .filter((n): n is number => n !== null);
  const next = findNextNumber(numbers);
  return `${prefix}-${String(next).padStart(3, '0')}`;
}

export function generateCustomerCode(existingCodes: string[]): string {
  const prefix = 'CUS';
  const numbers = existingCodes
    .map((s) => parseSuffix(s, prefix))
    .filter((n): n is number => n !== null);
  const next = findNextNumber(numbers);
  return `${prefix}-${String(next).padStart(3, '0')}`;
}

export function generateBookingCode(existingCodes: string[]): string {
  const prefix = 'BK';
  const numbers = existingCodes
    .map((s) => parseSuffix(s, prefix))
    .filter((n): n is number => n !== null);
  const next = findNextNumber(numbers);
  return `${prefix}-${String(next).padStart(4, '0')}`;
}
