export const money = (n: number) => `${Math.round(n).toLocaleString('en-US')}₮`;

export const pad = (n: number) => String(n).padStart(2, '0');

/** 2026-11-08 */
export const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** 11.08 */
export const shortDate = (s: string | Date) => {
  const d = typeof s === 'string' ? new Date(s) : s;
  return `${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
};

/** 2026.11.08 14:30 */
export const dateTime = (s: string) => {
  const d = new Date(s);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Сайхан амраарай,';
  if (h < 12) return 'Өглөөний мэнд,';
  if (h < 18) return 'Өдрийн мэнд,';
  return 'Оройн мэнд,';
};

/** «2003-04-12» хэлбэрийг шалгана */
export function parseBirthDate(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  if (y < 1920 || date > new Date()) return null;
  return date;
}

/** Бичих явцад 20030412 → 2003-04-12 болгоно */
export function maskDate(input: string) {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

/** Үнийн тооцоо — өгөгдлийн сангийн trigger-тэй ижил дүрэм (зөвхөн харуулах зориулалттай) */
export const DISCOUNTS: Record<number, number> = { 1: 0, 3: 10, 5: 20 };
export const calcTotal = (unit: number, count: number) =>
  Math.round((unit * count * (100 - (DISCOUNTS[count] ?? 0))) / 100);

export const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
