// Supabase төслийн нийтэд нээлттэй тохиргоо.
// Publishable (anon) түлхүүр нь апп дотор ил байхаар зориулагдсан — өгөгдлийг RLS хамгаална.
// .env файлд EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY байвал тэдгээрийг давуу эрхтэй ашиглана.
// АНХААР: service_role / secret түлхүүрийг ЭНД ХЭЗЭЭ Ч бүү бич.
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ssikwnfzflsqkmnfrfel.supabase.co';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Z_mO3URJKCPKMr-wlUJCVA__BoK27No';
