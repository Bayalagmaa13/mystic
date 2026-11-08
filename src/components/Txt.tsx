import { Text, type TextProps, StyleSheet } from 'react-native';
import { colors, fonts } from '@/lib/theme';

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodyStrong' | 'muted' | 'small' | 'label' | 'gold' | 'overline';

/** Аппын бүх текст энэ компонентоор дамжина — фонт, өнгө нэг дор удирдагдана */
export function Txt({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  return <Text {...rest} style={[styles.base, styles[variant], style]} />;
}

const styles = StyleSheet.create({
  base: { color: colors.text, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  display: { fontFamily: fonts.display, fontSize: 38, lineHeight: 46 },
  h1: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34 },
  h2: { fontFamily: fonts.display, fontSize: 21, lineHeight: 27 },
  h3: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  body: {},
  bodyStrong: { fontFamily: fonts.semibold },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  small: { color: colors.muted, fontSize: 12, lineHeight: 16 },
  label: { color: colors.textSoft, fontFamily: fonts.medium, fontSize: 13 },
  gold: { color: colors.gold, fontFamily: fonts.semibold },
  overline: { color: colors.gold, fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.8 },
});
