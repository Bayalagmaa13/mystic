// Сарны фаз — шинэ сарны мэдэгдэж буй огнооноос (2000-01-06 18:14 UTC) тооцно.
// Сарны нэг мөчлөг ≈ 29.53 хоног.
const SYNODIC = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

const PHASES = [
  { name: 'Шинэ сар', icon: 'ellipse-outline', tip: 'Шинэ зорилго тавих, хүсэл бичих цаг.' },
  { name: 'Шинэ хавирган сар', icon: 'moon-outline', tip: 'Эхлүүлсэн зүйлдээ эрч хүч нэмэх үе.' },
  { name: 'Эхний дөрөвний нэг', icon: 'contrast-outline', tip: 'Саад бэрхшээлийг шийдвэртэй давах өдөр.' },
  { name: 'Өсөж буй сар', icon: 'moon', tip: 'Ажлаа нарийвчилж, сайжруулах цаг.' },
  { name: 'Тэргэл сар', icon: 'ellipse', tip: 'Үр дүнгээ харж, баярлах, талархах өдөр.' },
  { name: 'Хасагдаж буй сар', icon: 'moon', tip: 'Сурсан зүйлээ бусадтай хуваалцах үе.' },
  { name: 'Сүүлийн дөрөвний нэг', icon: 'contrast-outline', tip: 'Хэрэггүй зүйлээ орхиж, цэгцлэх цаг.' },
  { name: 'Хуучин хавирган сар', icon: 'moon-outline', tip: 'Амарч, дотоод хүчээ хуримтлуулах үе.' },
];

export function moonPhase(date = new Date()) {
  const days = (date.getTime() - KNOWN_NEW_MOON) / 86400000;
  const age = ((days % SYNODIC) + SYNODIC) % SYNODIC; // 0..29.5
  const index = Math.floor(((age / SYNODIC) * 8 + 0.5)) % 8;
  // Гэрэлтсэн хэсэг (0..1)
  const illumination = (1 - Math.cos((2 * Math.PI * age) / SYNODIC)) / 2;
  return { ...PHASES[index], age: Math.round(age), illumination: Math.round(illumination * 100) };
}
