import { PRICING } from '@/lib/event-config';
import type { AccommodationType, StayDays } from '@/shared/registration.interface';

export function accommodationAmountCents(
  accommodationType: AccommodationType,
  stayDays: StayDays,
): number {
  if (stayDays === 'full') {
    return accommodationType === 'Suíte'
      ? PRICING.suitePerPerson
      : PRICING.alojamentoFull;
  }
  const days = Number(stayDays);
  return PRICING.dailyPerDay * days;
}

export type RegistrationPriceOptions = {
  accommodationType: AccommodationType;
  stayDays: StayDays;
  isSuite: boolean;
  shirtQuantity: number;
};

export type RegistrationPriceBreakdown = {
  lodgingPerPersonCents: number;
  peopleCount: number;
  lodgingTotalCents: number;
  shirtQuantity: number;
  shirtCents: number;
  totalCents: number;
};

export function shirtAmountCents(quantity: number): number {
  const shirtQuantity = Math.max(0, quantity);
  const pairs = Math.floor(shirtQuantity / 2);
  return shirtQuantity * PRICING.shirt - pairs * PRICING.shirtPairDiscount;
}

export function getRegistrationPriceBreakdown(
  options: RegistrationPriceOptions,
): RegistrationPriceBreakdown {
  const lodgingPerPersonCents = accommodationAmountCents(
    options.accommodationType,
    options.stayDays,
  );
  const peopleCount = options.isSuite ? 2 : 1;
  const shirtQuantity = Math.max(0, options.shirtQuantity);
  const shirtCents = shirtAmountCents(shirtQuantity);
  const lodgingTotalCents = lodgingPerPersonCents * peopleCount;
  const totalCents = lodgingTotalCents + shirtCents;

  return {
    lodgingPerPersonCents,
    peopleCount,
    lodgingTotalCents,
    shirtQuantity,
    shirtCents,
    totalCents,
  };
}

export function formatBrlFromCents(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
