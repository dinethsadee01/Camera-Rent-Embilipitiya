import type { ItemCategory } from './types';

export interface FreeSuggestion {
  type: 'free';
  label: string;
}

export interface ItemCategorySuggestion {
  type: 'item';
  category: ItemCategory;
  hint: string;
}

export type BundleSuggestion = FreeSuggestion | ItemCategorySuggestion;

// Keyed by ItemCategory — suggestions shown when an item of that category is in the booking
export const BUNDLE_SUGGESTIONS: Partial<Record<ItemCategory, BundleSuggestion[]>> = {
  camera: [
    { type: 'free', label: 'Side Bag' },
    { type: 'free', label: 'Battery' },
    { type: 'free', label: 'Memory Card' },
    { type: 'free', label: 'Battery Charger' },
    { type: 'item', category: 'lens', hint: '+ Lens' },
    { type: 'item', category: 'lighting', hint: '+ Lighting' },
  ],
  lens: [
    { type: 'free', label: 'Lens Bag' },
  ],
  lighting: [
    { type: 'item', category: 'accessory', hint: '+ Flash Trigger' },
  ],
};
