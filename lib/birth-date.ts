/** Brazilian birth date: DD/MM/YYYY */

const BR_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export function maskBirthDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function isCompleteBirthDate(value: string): boolean {
  return BR_DATE.test(value.trim());
}

function parseBrDate(value: string): Date | null {
  const match = value.trim().match(BR_DATE);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/** Supports DD/MM/YYYY or legacy YYYY-MM-DD */
export function parseBirthDate(value: string): Date | null {
  if (!value) return null;
  if (value.includes('/')) return parseBrDate(value);
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const date = new Date(
      Number(iso[1]),
      Number(iso[2]) - 1,
      Number(iso[3]),
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

export function calculateAgeFromBirthDate(birthDate: string): number | null {
  const date = parseBirthDate(birthDate);
  if (!date) return null;
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
  return age;
}

export function isBirthDateInFuture(birthDate: string): boolean {
  const date = parseBirthDate(birthDate);
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() > today.getTime();
}
