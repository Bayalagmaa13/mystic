# Mystic ✦ Зурхай ба Тарот

Н. Баялагмаа (B22FT1005, 498)

Өдөр тутмын зурхай, ордын тохироо, өдрийн тарот хөзөр зэргийг үнэгүй үзэх боломжтой. Таротчинд асуулт илгээх үйлчилгээг QPay-ээр төлнө. React Native (Expo) болон Supabase дээр хийсэн full-stack мобайл апп.

## Шийдэх асуудал
Монголд тарот, зурхайн үйлчилгээ ихэвчлэн Facebook, утсаар явагддаг. Үнэ нь тодорхой бус, төлбөрийг гараар шилжүүлдэг, хариултаа хаана авахаа мэддэггүй. Mystic энэ бүх процессыг нэг апп дотор шийднэ: таротчноо сонгоно, үнэ нь асуултын тооноос хамаарч тодорхой харагдана, QPay-ээр төлнө, хариултаа апп дотроос уншина.

## Технологи
| Хэсэг | Технологи |
|---|---|
| Frontend | React Native 0.88 · Expo SDK 58 · TypeScript |
| Навигаци | Expo Router (Stack + Tabs, хамгаалалттай дэлгэц) |
| UI | Өөрийн дизайны систем (`src/lib/theme.ts`, `src/components`), Playfair Display + Inter фонт, expo-linear-gradient, Animated API |
| Backend | Supabase: Auth, PostgreSQL, RLS, Storage, Realtime, Edge Functions |
| Төлбөр | QPay v2 (sandbox) + webhook |
| Push | expo-notifications + Expo Push API |
| Build | EAS Build (APK) |

## Боломжууд

**Удирдамжаар заавал хийх зүйлс**
- **Бүртгэл ба эрх:** бүртгүүлэх, нэвтрэх, гарах, нууц үг сэргээх. Session-ийг SecureStore-д хувааж (chunk) хадгална. Зочин нэвтрэлгүйгээр үзэж болно, хэрэглэгчийн дэлгэцүүдэд нэвтрэлт шаардлагатай.
- **Өгөгдлийн сан:** 12 хүснэгт. 1:N (орд → зурхай, захиалга → асуулт), N:M (`reader_topics`, `favorites`), 1:1 (`payments`, `reviews`).
- **CRUD:** захиалга үүсгэх, харах, асуулт засах, цуцлах, устгах. Дуртай таротчин нэмэх/хасах, үнэлгээ өгөх/засах, профайл засах. Формын шалгалттай, устгахын өмнө баталгаажуулах цонхтой.
- **Камер:** профайл зургийг камер эсвэл цомгоос сонгоно. 512px болгож, JPEG 70% шахаад Supabase Storage-д хадгална.
- **Төлбөр:** QPay нэхэмжлэх (QR + банкны апп руу шилжих deep link). Webhook ирэхэд төлөв «Хүлээгдэж буй»-гаас «Төлөгдсөн» болно.
- **Push мэдэгдэл:** төлбөр орох үед илгээнэ, мэдэгдэл дээр дарахад тухайн захиалга нээгдэнэ.
- **Хайлт ба шүүлт:** таротчдыг нэрээр (debounce) хайна, сэдвээр шүүнэ, үнэлгээ/үнэ/шинээр эрэмбэлнэ. Infinite scroll, pull-to-refresh, захиалгыг төлвөөр шүүнэ.
- **UI төлөвүүд:** ачаалж буй (skeleton), хоосон, алдаа (дахин оролдох товчтой), интернэт тасарсан (NetInfo).
- **Аюулгүй байдал:** бүх 12 хүснэгтэд RLS. Үнийг серверийн trigger тооцдог, төлвийг хэрэглэгч гараар өөрчлөх боломжгүй. `service_role` түлхүүр зөвхөн Edge Function-д байна.

**Шинэлэг нэмэлтүүд**
- **Өдрийн тарот хөзөр:** 3D эргэлттэй анимаци, haptic чичиргээтэй. Өдөрт нэг удаа эргүүлнэ (`daily_draws` хүснэгт), 22 Их Арканы монгол тайлбартай.
- **Ордын тохироо:** махбод болон зурхайн тойрог дээрх зайгаар хайр, нөхөрлөл, хамтын ажлын хувийг тооцоолно. Хуваалцах боломжтой.
- **Сарны фаз:** өнөөдрийн сарны байдал, гэрэлтсэн хувь, зөвлөгөө.
- **Realtime:** төлбөр орох эсвэл хариулт ирэхэд захиалгын дэлгэц дахин ачаалалгүйгээр шууд шинэчлэгдэнэ.
- **Өглөөний сануулга:** өдөр бүр 9 цагт «Өнөөдрийн зурхай» локал мэдэгдэл ирнэ.
-  **Захиалгын явцын timeline**, анивчих оддын анимаци, зурхайг хуваалцах.

## 12 орд 
Хонь ♈ · Үхэр ♉ · Ихэр ♊ · Мэлхий ♋ · Арслан ♌ · Охин ♍ · Жинлүүр ♎ · Хилэнц ♏ · Нум ♐ · Матар ♑ · Хумх ♒ · Загас ♓

---

## Ажиллуулах заавар

### 1. Supabase төсөл
1. [supabase.com](https://supabase.com) дээр шинэ төсөл үүсгэнэ.
2. **SQL Editor** дээр `supabase/migrations/0001_schema.sql`-ийг бүхэлд нь хуулж **Run** дарна. Дараа нь `0002_seed.sql`-ийг мөн ажиллуулна.
3. **Authentication → Sign In / Providers → Email** хэсэгт туршилтын үед *Confirm email*-ийг унтраавал бүртгүүлсэн даруйдаа нэвтэрнэ.
4. **Project Settings → API** хэсгээс `Project URL` болон `anon` (эсвэл publishable) түлхүүрийг хуулна.

### 2. Аппын тохиргоо
```bash
cd Mystic
copy .env.example .env        # Windows (Mac/Linux: cp)
# .env дотор URL, anon түлхүүрээ бичнэ
npm install
npx expo start
```
Утсандаа **Expo Go**-г суулгаад QR кодыг уншуулна. Android эмулятор ашиглах бол `a` товч дарна.

### 3. QPay Edge Functions
```bash
npx supabase login
npx supabase link --project-ref <таны-project-ref>
copy supabase\.env.example supabase\.env
npx supabase secrets set --env-file supabase/.env
npx supabase functions deploy qpay-create-invoice
npx supabase functions deploy qpay-check
npx supabase functions deploy qpay-webhook --no-verify-jwt
```
- `QPAY_MODE=sandbox` нь QPay-ийн туршилтын орчин.
- `QPAY_MODE=mock` нь QPay-гүйгээр demo хийх горим: «Төлбөр шалгах» дарахад шууд төлөгдсөн болно. Хамгаалалтын үед интернэт муу байвал нөөц болгон ашиглаж болно.

### 4. Push мэдэгдэл ба APK (Хамгаалалт-2)
```bash
npm i -g eas-cli
eas login
eas init                       # app.json-д projectId нэмэгдэнэ
eas build -p android --profile preview
```
Android дээр Expo Go push мэдэгдэл дэмжихгүй тул push-ийг APK дээр шалгана.

### 5. Админ эрх
SQL Editor дээр:
```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'таны@имэйл.mn');
```

---

## Хавтасны бүтэц
```
app/                      ← Expo Router дэлгэцүүд (файл = маршрут)
  (auth)/                 login, register, forgot
  (tabs)/                 Нүүр, Зурхай, Тарот, Захиалга, Профайл
  zodiac/[slug].tsx       Ордын зурхай (өчигдөр/өнөөдөр/маргааш)
  reader/[id].tsx         Таротчны профайл
  order/new.tsx           Захиалга үүсгэх (CREATE)
  order/[id].tsx          Дэлгэрэнгүй, засах, цуцлах, устгах, үнэлгээ
  order/pay/[id].tsx      QPay төлбөр + Realtime
  compatibility.tsx       Ордын тохироо
src/
  components/             Дахин ашиглах UI (Button, Input, Card, TarotCardFlip…)
  context/AuthContext     Нэвтрэлтийн төлөв (session, profile)
  hooks/                  useQuery, useRequireAuth, useOrderRealtime, useDebounced
  services/api.ts         Supabase-тэй харилцах бүх функц
  lib/                    supabase клиент, theme, zodiac, tarot, moon, image, notifications
supabase/
  migrations/             Схем, RLS, trigger, seed
  functions/              qpay-create-invoice, qpay-check, qpay-webhook
```

## ERD (товч)
`zodiac_signs` 1─N `profiles`, `daily_horoscopes`
`profiles` 1─N `orders`, `favorites`, `daily_draws`
`tarot_readers` N─M `topics` (`reader_topics`), N─M `profiles` (`favorites`)
`orders` 1─N `order_questions`, 1─1 `payments`, 1─1 `reviews`

## Төлбөрийн урсгал
```
Апп ──(1) createOrder──▶ orders (trigger үнийг тооцно, status=pending)
Апп ──(2) qpay-create-invoice──▶ QPay /v2/invoice ──▶ QR + deeplinks
Хэрэглэгч ──(3) банкны апп──▶ QPay
QPay ──(4) callback──▶ qpay-webhook ──▶ QPay /v2/payment/check (дахин шалгана)
                                     └▶ payments.paid, orders.paid + push
Апп ◀──(5) Realtime UPDATE── orders  ⇒  «Төлбөр амжилттай» дэлгэц
```


