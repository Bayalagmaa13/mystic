// Тарот — Их Аркан (Major Arcana) 22 хөзөр, монгол тайлбартай
// «Өдрийн хөзөр» боломжид ашиглана.

export interface TarotCard {
  id: number;
  roman: string;
  name: string;
  icon: string; // Ionicons нэр
  upright: string;
  reversed: string;
}

export const MAJOR_ARCANA: TarotCard[] = [
  { id: 0, roman: '0', name: 'Тэнэг', icon: 'walk-outline', upright: 'Шинэ эхлэл, гэнэн итгэл, эрсдэл даахаас бүү ай.', reversed: 'Болгоомжгүй алхам. Үсрэхээсээ өмнө доош хар.' },
  { id: 1, roman: 'I', name: 'Илбэчин', icon: 'color-wand-outline', upright: 'Танд бүх хэрэгсэл бий. Хүсэл зоригоо үйлдэл болго.', reversed: 'Чадвараа дутуу ашиглаж байна. Төвлөрлөө сэргээ.' },
  { id: 2, roman: 'II', name: 'Тахилч эмэгтэй', icon: 'moon-outline', upright: 'Зөн совиндоо итгэ. Хариулт дотор чинь байна.', reversed: 'Дотоод дуу хоолойгоо үл тоож байна.' },
  { id: 3, roman: 'III', name: 'Хатан хаан', icon: 'flower-outline', upright: 'Элбэг дэлбэг, бүтээлч байдал, халамж.', reversed: 'Өөрийгөө орхигдуулж байна. Өөртөө анхаар.' },
  { id: 4, roman: 'IV', name: 'Хаан', icon: 'shield-outline', upright: 'Тогтвортой байдал, бүтэц, манлайлал.', reversed: 'Хэт хатуу хяналт. Уян хатан бай.' },
  { id: 5, roman: 'V', name: 'Санваартан', icon: 'book-outline', upright: 'Уламжлал, багш, итгэлт зөвлөгч.', reversed: 'Дүрэм журмыг эргэцүүлэн бодох цаг.' },
  { id: 6, roman: 'VI', name: 'Хайрлагчид', icon: 'heart-outline', upright: 'Хайр, эв найрамдал, зүрхний сонголт.', reversed: 'Үнэт зүйлсийн зөрчил. Шийдвэрээ эргэн хар.' },
  { id: 7, roman: 'VII', name: 'Тэрэг', icon: 'rocket-outline', upright: 'Ялалт, шийдэмгий хөдөлгөөн, хяналт.', reversed: 'Чиглэлээ алдсан байна. Жолоогоо барь.' },
  { id: 8, roman: 'VIII', name: 'Хүч', icon: 'flame-outline', upright: 'Дотоод хүч, тэвчээр, зөөлөн зориг.', reversed: 'Өөртөө эргэлзэж байна. Чи чадна.' },
  { id: 9, roman: 'IX', name: 'Даяанч', icon: 'flashlight-outline', upright: 'Ганцаардал, эргэцүүлэл, дотоод гэрэл.', reversed: 'Хэт тусгаарлагдсан. Хүмүүстэй холбогд.' },
  { id: 10, roman: 'X', name: 'Хувь заяаны хүрд', icon: 'sync-outline', upright: 'Өөрчлөлт, мөчлөг, аз таарна.', reversed: 'Тааламжгүй эргэлт. Удахгүй өнгөрнө.' },
  { id: 11, roman: 'XI', name: 'Шударга ёс', icon: 'scale-outline', upright: 'Үнэн, шударга байдал, үр дагавар.', reversed: 'Шударга бус байдал. Хариуцлагаа ухамсарла.' },
  { id: 12, roman: 'XII', name: 'Дүүжлэгдсэн хүн', icon: 'hourglass-outline', upright: 'Түр зогсолт, шинэ өнцгөөс харах.', reversed: 'Хүлээлт удааширлаа. Шийдвэр гарга.' },
  { id: 13, roman: 'XIII', name: 'Үхэл', icon: 'leaf-outline', upright: 'Нэг үе дуусч, шинэ үе эхэлнэ. Хувирал.', reversed: 'Өөрчлөлтийг эсэргүүцэж байна.' },
  { id: 14, roman: 'XIV', name: 'Тэвчээр', icon: 'water-outline', upright: 'Тэнцвэр, хэмжээ, тайван урсгал.', reversed: 'Тэнцвэр алдагдсан. Хэтрүүлэхээс сэргийл.' },
  { id: 15, roman: 'XV', name: 'Чөтгөр', icon: 'link-outline', upright: 'Донтолт, хүлээс, сорилт.', reversed: 'Гинжээ тасдах хүч чамд байна.' },
  { id: 16, roman: 'XVI', name: 'Цамхаг', icon: 'thunderstorm-outline', upright: 'Гэнэтийн өөрчлөлт, хуурмаг нурна.', reversed: 'Гамшгаас зайлсхийсэн ч сургамж үлдэнэ.' },
  { id: 17, roman: 'XVII', name: 'Од', icon: 'star-outline', upright: 'Итгэл найдвар, сэргэлт, урам зориг.', reversed: 'Итгэлээ сэргээх хэрэгтэй.' },
  { id: 18, roman: 'XVIII', name: 'Сар', icon: 'cloudy-night-outline', upright: 'Зөн, нууцлаг байдал, мөрөөдөл.', reversed: 'Төөрөгдөл арилж, үнэн тодорно.' },
  { id: 19, roman: 'XIX', name: 'Нар', icon: 'sunny-outline', upright: 'Баяр баясгалан, амжилт, эрч хүч.', reversed: 'Түр зуурын бүрхэг. Нар дахин гарна.' },
  { id: 20, roman: 'XX', name: 'Шүүлт', icon: 'megaphone-outline', upright: 'Сэрэлт, дуудлага, шинэ шийдвэр.', reversed: 'Өөрийгөө хэт шүүмжилж байна.' },
  { id: 21, roman: 'XXI', name: 'Ертөнц', icon: 'planet-outline', upright: 'Бүрэн дүүрэн байдал, зорилгодоо хүрэх.', reversed: 'Дуусгаагүй ажлаа дуусга.' },
];

/** Зочинд: огноо дээр тулгуурласан тогтмол хөзөр (нэг өдөр нэг л хөзөр) */
export function guestCardForToday(seed = 0) {
  const d = new Date();
  const n = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate() + seed;
  return { cardId: (n * 7919) % 22, reversed: n % 5 === 0 };
}

export const randomDraw = () => ({
  cardId: Math.floor(Math.random() * 22),
  reversed: Math.random() < 0.25,
});
