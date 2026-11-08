-- =====================================================================
-- Mystic · SWM231 · Supabase схем
-- Supabase Dashboard → SQL Editor дээр бүхэлд нь ажиллуулна.
-- Дараа нь 0002_seed.sql-ийг ажиллуулна.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. ZODIAC_SIGNS — 12 орд (лавлах хүснэгт)
-- ---------------------------------------------------------------------
create table public.zodiac_signs (
  id          smallint primary key,               -- 1..12
  slug        text unique not null,               -- aries, taurus ...
  name_mn     text not null,                      -- Хонь, Үхэр ...
  symbol      text not null,                      -- ♈ ...
  element     text not null check (element in ('Гал','Шороо','Хий','Ус')),
  planet      text not null,
  start_month smallint not null, start_day smallint not null,
  end_month   smallint not null, end_day   smallint not null,
  traits      text not null
);

-- ---------------------------------------------------------------------
-- 2. PROFILES — auth.users-тэй 1:1
-- ---------------------------------------------------------------------
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  full_name      text not null default '',
  birth_date     date,
  zodiac_sign_id smallint references public.zodiac_signs(id),
  role           text not null default 'user' check (role in ('user','admin')),
  avatar_url     text,
  push_token     text,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. DAILY_HOROSCOPES — ордын өдрийн зурхай (zodiac_signs 1:N)
-- ---------------------------------------------------------------------
create table public.daily_horoscopes (
  id             uuid primary key default gen_random_uuid(),
  sign_id        smallint not null references public.zodiac_signs(id) on delete cascade,
  horoscope_date date not null,
  content        text not null,
  love_score     smallint not null check (love_score between 1 and 10),
  career_score   smallint not null check (career_score between 1 and 10),
  money_score    smallint not null check (money_score between 1 and 10),
  health_score   smallint not null check (health_score between 1 and 10),
  lucky_color    text not null,
  lucky_number   smallint not null,
  unique (sign_id, horoscope_date)
);

-- ---------------------------------------------------------------------
-- 4. TOPICS — асуултын сэдэв
-- ---------------------------------------------------------------------
create table public.topics (
  id   smallint primary key,
  slug text unique not null,
  name text not null,
  icon text not null           -- Ionicons нэр
);

-- ---------------------------------------------------------------------
-- 5. TAROT_READERS — таротчид (админ удирдана)
-- ---------------------------------------------------------------------
create table public.tarot_readers (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  bio                text not null default '',
  photo_url          text,
  price_per_question integer not null check (price_per_question > 0),
  experience_years   smallint not null default 1,
  rating             numeric(2,1) not null default 0,
  review_count       integer not null default 0,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 6. READER_TOPICS — таротчин ↔ сэдэв (N:M)
-- ---------------------------------------------------------------------
create table public.reader_topics (
  reader_id uuid     references public.tarot_readers(id) on delete cascade,
  topic_id  smallint references public.topics(id) on delete cascade,
  primary key (reader_id, topic_id)
);

-- ---------------------------------------------------------------------
-- 7. FAVORITES — хэрэглэгч ↔ таротчин (N:M)
-- ---------------------------------------------------------------------
create table public.favorites (
  user_id    uuid references public.profiles(id) on delete cascade,
  reader_id  uuid references public.tarot_readers(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, reader_id)
);

-- ---------------------------------------------------------------------
-- 8. ORDERS — захиалга
-- ---------------------------------------------------------------------
create table public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_no       text unique not null default ('MY-' || to_char(now(),'YYMMDD') || '-' || upper(substr(md5(random()::text),1,4))),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  reader_id      uuid not null references public.tarot_readers(id),
  topic_id       smallint not null references public.topics(id),
  question_count smallint not null check (question_count in (1,3,5)),
  unit_price     integer not null default 0,
  discount_pct   smallint not null default 0,
  total_amount   integer not null default 0,
  status         text not null default 'pending'
                 check (status in ('pending','paid','answered','cancelled')),
  created_at     timestamptz not null default now(),
  paid_at        timestamptz,
  answered_at    timestamptz
);
create index on public.orders (user_id, created_at desc);

-- ---------------------------------------------------------------------
-- 9. ORDER_QUESTIONS — захиалгын асуултууд (orders 1:N)
-- ---------------------------------------------------------------------
create table public.order_questions (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders(id) on delete cascade,
  position       smallint not null,
  question       text not null check (char_length(question) between 5 and 500),
  answer         text,
  card_name      text,
  card_image_url text,
  unique (order_id, position)
);

-- ---------------------------------------------------------------------
-- 10. PAYMENTS — QPay нэхэмжлэх (orders 1:1)
-- ---------------------------------------------------------------------
create table public.payments (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null unique references public.orders(id) on delete cascade,
  provider       text not null default 'qpay',
  invoice_id     text,
  qr_text        text,
  qr_image       text,
  deeplinks      jsonb not null default '[]',
  amount         integer not null,
  status         text not null default 'pending' check (status in ('pending','paid','failed')),
  callback_token text not null default encode(gen_random_bytes(16),'hex'),
  created_at     timestamptz not null default now(),
  paid_at        timestamptz
);

-- ---------------------------------------------------------------------
-- 11. REVIEWS — үнэлгээ (orders 1:1)
-- ---------------------------------------------------------------------
create table public.reviews (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null unique references public.orders(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  reader_id  uuid not null references public.tarot_readers(id) on delete cascade,
  rating     smallint not null check (rating between 1 and 5),
  comment    text,
  reviewer_name text not null default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 12. DAILY_DRAWS — «Өдрийн хөзөр» (шинэлэг боломж)
-- ---------------------------------------------------------------------
create table public.daily_draws (
  user_id   uuid references public.profiles(id) on delete cascade,
  draw_date date not null default current_date,
  card_id   smallint not null check (card_id between 0 and 21),
  reversed  boolean not null default false,
  primary key (user_id, draw_date)
);

-- =====================================================================
-- ФУНКЦ, TRIGGER
-- =====================================================================

-- Төрсөн огнооноос ордыг олох
create or replace function public.zodiac_for_date(d date)
returns smallint language sql stable as $$
  -- md = сар*100 + өдөр, жишээ нь 4 сарын 12 = 412
  select z.id from public.zodiac_signs z,
         lateral (select extract(month from d)::int * 100 + extract(day from d)::int as md) x,
         lateral (select z.start_month * 100 + z.start_day as s, z.end_month * 100 + z.end_day as e) r
  where case when r.s <= r.e then x.md between r.s and r.e      -- энгийн орд
             else x.md >= r.s or x.md <= r.e end                 -- Матар: 12.22 – 1.19
  limit 1;
$$;

-- Админ эсэх
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Шинэ хэрэглэгч бүртгүүлэхэд profile автоматаар үүсгэнэ
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare bd date;
begin
  bd := nullif(new.raw_user_meta_data->>'birth_date','')::date;
  insert into public.profiles (id, full_name, birth_date, zodiac_sign_id)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name',''),
          bd,
          case when bd is null then null else public.zodiac_for_date(bd) end);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Төрсөн огноо өөрчлөгдөхөд ордыг дахин тооцно
create or replace function public.profiles_sync_zodiac()
returns trigger language plpgsql as $$
begin
  if new.birth_date is distinct from old.birth_date then
    new.zodiac_sign_id := case when new.birth_date is null then null
                               else public.zodiac_for_date(new.birth_date) end;
  end if;
  -- Энгийн хэрэглэгч өөрийн эрхийг өөрчилж чадахгүй
  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end $$;

create trigger profiles_before_update
  before update on public.profiles
  for each row execute function public.profiles_sync_zodiac();

-- ЗАХИАЛГЫН ҮНИЙГ СЕРВЕР ТАЛД ТООЦНО — апп дээрээс үнэ илгээхийг үл тооно.
-- 1 асуулт: 0%, 3 асуулт: 10%, 5 асуулт: 20% хөнгөлөлт
create or replace function public.orders_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare price integer; active boolean;
begin
  select price_per_question, is_active into price, active
  from public.tarot_readers where id = new.reader_id;
  if price is null or not active then
    raise exception 'Таротчин олдсонгүй эсвэл идэвхгүй байна';
  end if;
  new.user_id      := auth.uid();
  new.status       := 'pending';
  new.unit_price   := price;
  new.discount_pct := case new.question_count when 3 then 10 when 5 then 20 else 0 end;
  new.total_amount := round(price * new.question_count * (100 - new.discount_pct) / 100.0);
  new.paid_at := null; new.answered_at := null;
  return new;
end $$;

create trigger orders_before_insert
  before insert on public.orders
  for each row execute function public.orders_before_insert();

-- Хэрэглэгч зөвхөн «pending → cancelled» төлөв өөрчилж чадна.
-- «paid» төлөвийг зөвхөн webhook (service_role) тавина.
create or replace function public.orders_before_update()
returns trigger language plpgsql as $$
begin
  if auth.role() = 'service_role' or public.is_admin() then
    if new.status = 'paid' and old.status <> 'paid' then new.paid_at := now(); end if;
    if new.status = 'answered' and old.status <> 'answered' then new.answered_at := now(); end if;
    return new;
  end if;
  if old.status <> 'pending' or new.status not in ('pending','cancelled') then
    raise exception 'Энэ захиалгын төлөвийг өөрчлөх боломжгүй';
  end if;
  if new.unit_price <> old.unit_price or new.total_amount <> old.total_amount
     or new.reader_id <> old.reader_id or new.question_count <> old.question_count
     or new.user_id <> old.user_id then
    raise exception 'Захиалгын үнэ, таротчныг өөрчлөх боломжгүй';
  end if;
  return new;
end $$;

create trigger orders_before_update
  before update on public.orders
  for each row execute function public.orders_before_update();

-- Үнэлгээ нэмэгдэх/өөрчлөгдөхөд таротчны дундаж оноог шинэчилнэ
create or replace function public.refresh_reader_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare rid uuid := coalesce(new.reader_id, old.reader_id);
begin
  update public.tarot_readers r set
    rating       = coalesce((select round(avg(rating)::numeric,1) from public.reviews where reader_id = rid), 0),
    review_count = (select count(*) from public.reviews where reader_id = rid)
  where r.id = rid;
  return null;
end $$;

create trigger reviews_after_change
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_reader_rating();

-- Үнэлгээг зөвхөн «answered» болсон өөрийн захиалгад өгнө
create or replace function public.reviews_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare o record;
begin
  select * into o from public.orders where id = new.order_id;
  if o is null or o.user_id <> auth.uid() or o.status <> 'answered' then
    raise exception 'Зөвхөн хариулт авсан захиалгадаа үнэлгээ өгнө';
  end if;
  new.user_id := o.user_id; new.reader_id := o.reader_id;
  select coalesce(nullif(split_part(full_name,' ',array_length(string_to_array(full_name,' '),1)),''),'Хэрэглэгч')
    into new.reviewer_name from public.profiles where id = o.user_id;
  return new;
end $$;

create trigger reviews_before_insert
  before insert on public.reviews
  for each row execute function public.reviews_before_insert();

-- =====================================================================
-- ROW LEVEL SECURITY — бүх хүснэгтэд
-- =====================================================================
alter table public.zodiac_signs     enable row level security;
alter table public.profiles         enable row level security;
alter table public.daily_horoscopes enable row level security;
alter table public.topics           enable row level security;
alter table public.tarot_readers    enable row level security;
alter table public.reader_topics    enable row level security;
alter table public.favorites        enable row level security;
alter table public.orders           enable row level security;
alter table public.order_questions  enable row level security;
alter table public.payments         enable row level security;
alter table public.reviews          enable row level security;
alter table public.daily_draws      enable row level security;

-- Нийтэд нээлттэй (зочин ч уншина), бичихийг зөвхөн админ
create policy "public read" on public.zodiac_signs     for select using (true);
create policy "public read" on public.daily_horoscopes for select using (true);
create policy "public read" on public.topics           for select using (true);
create policy "public read" on public.reader_topics    for select using (true);
create policy "public read" on public.reviews          for select using (true);
create policy "public read active" on public.tarot_readers for select using (is_active or public.is_admin());

create policy "admin write" on public.daily_horoscopes for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.tarot_readers    for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.reader_topics    for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.topics           for all using (public.is_admin()) with check (public.is_admin());

-- Profiles: өөрийнхөө мөрийг л харж, засна
create policy "own profile read"   on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "own profile update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Favorites
create policy "own favorites" on public.favorites for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Orders: өөрийн захиалга (CRUD)
create policy "own orders read"   on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "own orders insert" on public.orders for insert with check (auth.uid() is not null);
create policy "own orders update" on public.orders for update using (user_id = auth.uid() or public.is_admin());
create policy "own orders delete" on public.orders for delete
  using (user_id = auth.uid() and status in ('pending','cancelled'));

-- Order questions: эзэмшигч нь л хандана; хүлээгдэж буй үед засна
create policy "own questions read" on public.order_questions for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
create policy "own questions insert" on public.order_questions for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid() and o.status = 'pending'));
create policy "own questions update" on public.order_questions for update using (
  public.is_admin() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid() and o.status = 'pending'));

-- Payments: хэрэглэгч зөвхөн уншина. Бичихийг Edge Function (service_role) хийнэ.
create policy "own payments read" on public.payments for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));

-- Reviews
create policy "own review insert" on public.reviews for insert with check (auth.uid() is not null);
create policy "own review update" on public.reviews for update using (user_id = auth.uid());
create policy "own review delete" on public.reviews for delete using (user_id = auth.uid());

-- Daily draws
create policy "own draws" on public.daily_draws for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =====================================================================
-- REALTIME — захиалгын төлөв апп дээр шууд шинэчлэгдэнэ
-- =====================================================================
alter publication supabase_realtime add table public.orders;

-- =====================================================================
-- STORAGE — профайл зураг
-- =====================================================================
insert into storage.buckets (id, name, public) values ('avatars','avatars', true)
on conflict (id) do nothing;

create policy "avatar public read" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "avatar own upload" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar own update" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar own delete" on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================================
-- Data API эрх (RLS нь мөр бүрийн хандалтыг хязгаарлана)
-- =====================================================================
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
