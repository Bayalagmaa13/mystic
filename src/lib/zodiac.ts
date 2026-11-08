// 12 орд — монгол нэр (өгөгдлийн сангийн zodiac_signs хүснэгттэй ижил)
// Апп интернэтгүй үед ч ордыг харуулах, төрсөн огнооноос шууд тооцоход ашиглана.

export type Element = 'Гал' | 'Шороо' | 'Хий' | 'Ус';

export interface Sign {
  id: number;
  slug: string;
  name: string;
  symbol: string;
  element: Element;
  planet: string;
  start: [number, number]; // [сар, өдөр]
  end: [number, number];
  traits: string;
}

export const SIGNS: Sign[] = [
  { id: 1, slug: 'aries', name: 'Хонь', symbol: '♈', element: 'Гал', planet: 'Ангараг', start: [3, 21], end: [4, 19], traits: 'Зоримог, санаачлагатай, шийдэмгий. Шинэ зүйлийг хамгийн түрүүнд эхлүүлэгч.' },
  { id: 2, slug: 'taurus', name: 'Үхэр', symbol: '♉', element: 'Шороо', planet: 'Сугар', start: [4, 20], end: [5, 20], traits: 'Тэвчээртэй, найдвартай, гоо сайхныг мэдрэмтгий. Тогтвортой байдлыг эрхэмлэнэ.' },
  { id: 3, slug: 'gemini', name: 'Ихэр', symbol: '♊', element: 'Хий', planet: 'Буд', start: [5, 21], end: [6, 20], traits: 'Сониуч, яриасаг, уян хатан. Олон зүйлийг зэрэг сонирхоно.' },
  { id: 4, slug: 'cancer', name: 'Мэлхий', symbol: '♋', element: 'Ус', planet: 'Сар', start: [6, 21], end: [7, 22], traits: 'Халамжтай, мэдрэмжтэй, гэр бүлч. Ойр дотныхоо төлөө юу ч хийнэ.' },
  { id: 5, slug: 'leo', name: 'Арслан', symbol: '♌', element: 'Гал', planet: 'Нар', start: [7, 23], end: [8, 22], traits: 'Өгөөмөр, итгэлтэй, манлайлагч. Анхаарлын төвд байх дуртай.' },
  { id: 6, slug: 'virgo', name: 'Охин', symbol: '♍', element: 'Шороо', planet: 'Буд', start: [8, 23], end: [9, 22], traits: 'Нямбай, ухаалаг, туслах сэтгэлтэй. Нарийн ширийн зүйлийг анзаарна.' },
  { id: 7, slug: 'libra', name: 'Жинлүүр', symbol: '♎', element: 'Хий', planet: 'Сугар', start: [9, 23], end: [10, 22], traits: 'Шударга, эвлэрэнгүй, гоо зүйч. Тэнцвэр, эв найрамдлыг эрхэмлэнэ.' },
  { id: 8, slug: 'scorpio', name: 'Хилэнц', symbol: '♏', element: 'Ус', planet: 'Ангараг', start: [10, 23], end: [11, 21], traits: 'Хүсэл тэмүүлэлтэй, нууцлаг, үнэнч. Гүн гүнзгий мэдрэмжтэй.' },
  { id: 9, slug: 'sagittarius', name: 'Нум', symbol: '♐', element: 'Гал', planet: 'Бархасбадь', start: [11, 22], end: [12, 21], traits: 'Эрх чөлөөнд дуртай, өөдрөг, адал явдалч. Аялал, мэдлэгт тэмүүлнэ.' },
  { id: 10, slug: 'capricorn', name: 'Матар', symbol: '♑', element: 'Шороо', planet: 'Санчир', start: [12, 22], end: [1, 19], traits: 'Зорилготой, хариуцлагатай, тэвчээртэй. Алхам алхмаар оргилд хүрнэ.' },
  { id: 11, slug: 'aquarius', name: 'Хумх', symbol: '♒', element: 'Хий', planet: 'Санчир', start: [1, 20], end: [2, 18], traits: 'Шинэлэг сэтгэлгээтэй, бие даасан, хүмүүнлэг. Ирээдүйг харж сэтгэнэ.' },
  { id: 12, slug: 'pisces', name: 'Загас', symbol: '♓', element: 'Ус', planet: 'Бархасбадь', start: [2, 19], end: [3, 20], traits: 'Уран сэтгэмжтэй, энэрэнгүй, зөн совинтой. Урлаг, мөрөөдлийн ертөнцтэй ойр.' },
];

/** Тэмдэгтийг emoji биш, текст хэлбэрээр харуулах (iOS дээр emoji болохоос сэргийлнэ) */
export const glyph = (s: Sign) => `${s.symbol}︎`;

export const signById = (id?: number | null) => SIGNS.find((s) => s.id === id);
export const signBySlug = (slug?: string) => SIGNS.find((s) => s.slug === slug);

/** Төрсөн огнооноос ордыг олно. md = сар*100 + өдөр (жишээ: 4 сарын 12 → 412) */
export function signForDate(date: Date): Sign {
  const md = (date.getMonth() + 1) * 100 + date.getDate();
  return (
    SIGNS.find((s) => {
      const start = s.start[0] * 100 + s.start[1];
      const end = s.end[0] * 100 + s.end[1];
      return start <= end ? md >= start && md <= end : md >= start || md <= end; // Матар оны заагаар
    }) ?? SIGNS[0]
  );
}

export const formatRange = (s: Sign) => `${s.start[0]}.${s.start[1]} – ${s.end[0]}.${s.end[1]}`;

// ---------------- Ордын тохироо (шинэлэг боломж) ----------------
// Махбодын уялдаагаар тооцно: ижил махбод → өндөр, Гал+Хий / Шороо+Ус → дэмжинэ
const ELEMENT_MATCH: Record<Element, Record<Element, number>> = {
  Гал: { Гал: 82, Хий: 90, Шороо: 48, Ус: 40 },
  Хий: { Хий: 80, Гал: 90, Ус: 50, Шороо: 45 },
  Шороо: { Шороо: 84, Ус: 92, Гал: 48, Хий: 45 },
  Ус: { Ус: 86, Шороо: 92, Хий: 50, Гал: 40 },
};

export function compatibility(a: Sign, b: Sign) {
  const base = ELEMENT_MATCH[a.element][b.element];
  // Зурхайн тойрог дээрх зай: эсрэг орд (6) татах хүчтэй, хөрш орд (1) зөрчилдөөнтэй
  const dist = Math.min(Math.abs(a.id - b.id), 12 - Math.abs(a.id - b.id));
  const aspect = dist === 0 ? 4 : dist === 6 ? 6 : dist === 4 ? 5 : dist === 1 ? -6 : dist === 3 ? -4 : 0;
  const score = Math.max(25, Math.min(99, base + aspect));
  const love = Math.max(20, Math.min(99, score + ((a.id * 7 + b.id * 3) % 11) - 5));
  const friendship = Math.max(20, Math.min(99, score + ((a.id * 5 + b.id * 11) % 13) - 4));
  const work = Math.max(20, Math.min(99, score + ((a.id * 3 + b.id * 7) % 9) - 6));

  let verdict: string;
  if (score >= 85) verdict = 'Од эрхэс та хоёрыг ивээж байна! Бие биенээ ойлгох нь амархан, хамтдаа өсөж хөгжинө.';
  else if (score >= 70) verdict = 'Сайн хослол. Ялгаатай талуудаа хүндэтгэвэл бие биенээ сайхан нөхнө.';
  else if (score >= 50) verdict = 'Хүчин чармайлт шаардсан холбоо. Харилцан ярилцаж, буулт хийвэл бэхжинэ.';
  else verdict = 'Эсрэг тэсрэг энерги. Гэвч эсрэг туйлууд бие биенээ татдаг гэдгийг санаарай.';

  return { score, love, friendship, work, verdict };
}
