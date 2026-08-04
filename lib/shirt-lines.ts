import { PRICING } from '@/lib/event-config';
import type {
  ShirtLineItem,
  ShirtModel,
  ShirtSelection,
  ShirtSize,
} from '@/shared/registration.interface';

export function createEmptyShirtLine(): ShirtLineItem {
  return { model: '', size: '', quantity: 1 };
}

export function createEmptyShirtSelection(): ShirtSelection {
  return { wantsShirt: false, items: [] };
}

/** DB/docs may lack `items` or use legacy flat model/size/quantity. */
export function coerceShirtSelection(
  shirt: ShirtSelection | null | undefined | Record<string, unknown>,
): ShirtSelection {
  if (!shirt || shirt.wantsShirt !== true) {
    return createEmptyShirtSelection();
  }

  const raw = shirt as ShirtSelection & {
    model?: ShirtModel;
    size?: ShirtSize;
    quantity?: number;
  };

  if (Array.isArray(raw.items) && raw.items.length > 0) {
    return { wantsShirt: true, items: raw.items };
  }

  if (raw.model && raw.size) {
    return {
      wantsShirt: true,
      items: [
        {
          model: raw.model,
          size: raw.size,
          quantity: raw.quantity ?? 1,
        },
      ],
    };
  }

  return { wantsShirt: true, items: [] };
}

export function clampShirtLineQuantity(quantity: number): number {
  return Math.min(
    PRICING.shirtMaxQuantity,
    Math.max(1, Number.isFinite(quantity) ? quantity : 1),
  );
}

export function shirtLineUnits(quantity: number): number {
  if (!Number.isFinite(quantity) || quantity < 1) return 0;
  return Math.min(PRICING.shirtMaxQuantity, quantity);
}

export function totalShirtUnits(
  shirt: ShirtSelection | null | undefined | Record<string, unknown>,
): number {
  const normalized = coerceShirtSelection(shirt);
  if (normalized.wantsShirt !== true) return 0;
  return normalized.items.reduce(
    (sum, item) => sum + shirtLineUnits(item.quantity),
    0,
  );
}

export function formatShirtItemsSummary(
  shirt: ShirtSelection | null | undefined | Record<string, unknown>,
): string {
  const normalized = coerceShirtSelection(shirt);
  if (normalized.wantsShirt !== true || normalized.items.length === 0) {
    return '';
  }
  return normalized.items
    .filter((item) => item.model && item.size && shirtLineUnits(item.quantity) > 0)
    .map(
      (item) =>
        `${shirtLineUnits(item.quantity)}× ${item.model} (${item.size})`,
    )
    .join('; ');
}

export function validateShirtForSave(
  shirt: ShirtSelection | null | undefined | Record<string, unknown>,
): boolean {
  if (coerceShirtSelection(shirt).wantsShirt !== true) return true;
  return totalShirtUnits(shirt) >= 1;
}

export function normalizeShirtLineItem(item: ShirtLineItem): ShirtLineItem {
  return {
    model: item.model as ShirtModel,
    size: item.size as ShirtSize,
    quantity: clampShirtLineQuantity(item.quantity),
  };
}
