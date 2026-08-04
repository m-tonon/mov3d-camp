import { PRICING } from '@/lib/event-config';
import type {
  ShirtLineItem,
  ShirtModel,
  ShirtSelection,
} from '@/shared/registration.interface';
import {
  coerceShirtSelection,
  createEmptyShirtSelection,
  normalizeShirtLineItem,
} from '@/lib/shirt-lines';

export function normalizeShirtModelForDb(model: string): ShirtModel {
  if (model === 'Modelo 1' || model === 'Modelo 2') return model;
  return '';
}

export function normalizeShirtSelection(
  shirt: ShirtSelection | undefined | null,
): ShirtSelection {
  if (shirt?.wantsShirt !== true) {
    return createEmptyShirtSelection();
  }

  const coerced = coerceShirtSelection(shirt);
  const items = coerced.items
    .map((item) => ({
      ...item,
      model: item.model ? normalizeShirtModelForDb(item.model) : '',
    }))
    .filter((item) => item.model && item.size)
    .map((item) => normalizeShirtLineItem(item));

  if (items.length === 0) {
    return { wantsShirt: true, items: [] };
  }

  let running = 0;
  const capped: ShirtLineItem[] = [];
  for (const item of items) {
    if (running >= PRICING.shirtMaxQuantity) break;
    const qty = Math.min(item.quantity, PRICING.shirtMaxQuantity - running);
    if (qty < 1) break;
    capped.push({ ...item, quantity: qty });
    running += qty;
  }

  return { wantsShirt: true, items: capped };
}
