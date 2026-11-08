// Дизайны систем — Figma-гийн өнгө, фонт, зайтай ижил
export const colors = {
  bg: '#0F0B1E',
  bgDeep: '#08060F',
  surface: '#1A1530',
  surfaceHi: '#2A1F4D',
  border: '#2B2350',
  borderHi: '#4A3B85',
  gold: '#E8C27A',
  goldDeep: '#D49A4C',
  lavender: '#A99BFF',
  text: '#F4F0FF',
  textSoft: '#C9C2E0',
  muted: '#9C94B8',
  dim: '#7D7598',
  onGold: '#1A1028',
  success: '#6FE0B1',
  danger: '#FF8FA3',
  warning: '#F2C66D',
  info: '#7FB2FF',
  tabBar: '#140F28',
};

export const gradients = {
  gold: ['#E8C27A', '#D49A4C'] as const,
  hero: ['#3A2A6E', '#1F1840'] as const,
  screen: ['#2E2260', '#0F0B1E'] as const,
  card: ['#3A2A6E', '#1A1530'] as const,
  avatars: [
    ['#F3B6D9', '#A99BFF'],
    ['#E8C27A', '#F08A6C'],
    ['#8EE3D0', '#6C8BF0'],
    ['#C4A6FF', '#6E4FD8'],
  ] as const,
};

export const fonts = {
  display: 'PlayfairDisplay_700Bold',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const radius = { sm: 10, md: 14, lg: 16, xl: 24, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };

// Захиалгын төлөв → өнгө, монгол нэр
export const statusStyle: Record<string, { label: string; bg: string; fg: string }> = {
  pending: { label: 'Хүлээгдэж буй', bg: '#3B2F14', fg: '#F2C66D' },
  paid: { label: 'Төлөгдсөн', bg: '#1B2E4D', fg: '#7FB2FF' },
  answered: { label: 'Хариулсан', bg: '#143A2E', fg: '#6FE0B1' },
  cancelled: { label: 'Цуцлагдсан', bg: '#3D1A24', fg: '#FF8FA3' },
};
