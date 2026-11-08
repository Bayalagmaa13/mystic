// Өгөгдлийн сангийн хүснэгтүүдийн TypeScript төрөл (ERD-тэй ижил)

export type Role = 'user' | 'admin';
export type OrderStatus = 'pending' | 'paid' | 'answered' | 'cancelled';

export interface Profile {
  id: string;
  full_name: string;
  birth_date: string | null;
  zodiac_sign_id: number | null;
  role: Role;
  avatar_url: string | null;
  push_token: string | null;
  created_at: string;
}

export interface DailyHoroscope {
  id: string;
  sign_id: number;
  horoscope_date: string;
  content: string;
  love_score: number;
  career_score: number;
  money_score: number;
  health_score: number;
  lucky_color: string;
  lucky_number: number;
}

export interface Topic {
  id: number;
  slug: string;
  name: string;
  icon: string;
}

export interface TarotReader {
  id: string;
  name: string;
  bio: string;
  photo_url: string | null;
  price_per_question: number;
  experience_years: number;
  rating: number;
  review_count: number;
  is_active: boolean;
  created_at: string;
  reader_topics?: { topic_id: number; topics?: Topic | null }[];
}

export interface Order {
  id: string;
  order_no: string;
  user_id: string;
  reader_id: string;
  topic_id: number;
  question_count: 1 | 3 | 5;
  unit_price: number;
  discount_pct: number;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  paid_at: string | null;
  answered_at: string | null;
  tarot_readers?: Pick<TarotReader, 'id' | 'name' | 'price_per_question'> | null;
  topics?: Pick<Topic, 'id' | 'name' | 'icon'> | null;
  order_questions?: OrderQuestion[];
  reviews?: Review[] | Review | null;
}

export interface OrderQuestion {
  id: string;
  order_id: string;
  position: number;
  question: string;
  answer: string | null;
  card_name: string | null;
  card_image_url: string | null;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  invoice_id: string | null;
  qr_text: string | null;
  qr_image: string | null;
  deeplinks: { name: string; description?: string; logo?: string; link: string }[];
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  created_at: string;
  paid_at: string | null;
}

export interface Review {
  id: string;
  order_id: string;
  user_id: string;
  reader_id: string;
  rating: number;
  comment: string | null;
  reviewer_name: string;
  created_at: string;
}
