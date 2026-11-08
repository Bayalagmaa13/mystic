// Жижиг, олон дахин ашиглагдах UI хэсгүүд
import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Image, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, fonts, gradients, radius, statusStyle } from '@/lib/theme';
import { Txt } from './Txt';
import { Button } from './Button';

// ---------------------------------------------------------------- Card
export function Card({ children, style, highlight, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; highlight?: boolean; onPress?: () => void }) {
  const body = (
    <View style={[styles.card, highlight && { backgroundColor: colors.surfaceHi, borderColor: colors.borderHi }, style]}>{children}</View>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] })}>
      {body}
    </Pressable>
  );
}

// ---------------------------------------------------------------- Avatar
/** Зураг байвал зургийг, үгүй бол нэрийн эхний үсгийг градиент дээр харуулна */
export function Avatar({ name, uri, size = 48, seed = 0, ring }: { name: string; uri?: string | null; size?: number; seed?: number; ring?: boolean }) {
  const g = gradients.avatars[Math.abs(seed) % gradients.avatars.length];
  const style = { width: size, height: size, borderRadius: size / 2 };
  return (
    <View style={[style, ring && { borderWidth: 3, borderColor: colors.bg }, { overflow: 'hidden' }]}>
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} />
      ) : (
        <LinearGradient colors={g} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, styles.center]}>
          <Txt style={{ color: '#160F2E', fontFamily: fonts.display, fontSize: size * 0.38, lineHeight: size * 0.5 }}>
            {name.trim().split(' ').pop()?.[0]?.toUpperCase() ?? '✦'}
          </Txt>
        </LinearGradient>
      )}
    </View>
  );
}

/** Нэрээс тогтмол тоо гаргана (аватарын өнгө сонгоход) */
export const hashSeed = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);

// ---------------------------------------------------------------- Badge / Chip
export function Badge({ label, bg = colors.surfaceHi, fg = colors.textSoft }: { label: string; bg?: string; fg?: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Txt style={{ color: fg, fontSize: 11, fontFamily: fonts.semibold }}>{label}</Txt>
    </View>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = statusStyle[status] ?? statusStyle.pending;
  return <Badge label={s.label} bg={s.bg} fg={s.fg} />;
}

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && { backgroundColor: colors.lavender, borderColor: colors.lavender }]}
    >
      {icon ? <Ionicons name={icon} size={14} color={active ? '#160F2E' : colors.textSoft} /> : null}
      <Txt style={{ fontSize: 13, color: active ? '#160F2E' : colors.textSoft, fontFamily: active ? fonts.semibold : fonts.regular }}>{label}</Txt>
    </Pressable>
  );
}

// ---------------------------------------------------------------- Header
export function IconButton({ icon, onPress, color = colors.text, translucent }: { icon: keyof typeof Ionicons.glyphMap; onPress?: () => void; color?: string; translucent?: boolean }) {
  return (
    <Pressable
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [styles.iconBtn, translucent && { backgroundColor: 'rgba(15,11,30,0.55)', borderColor: 'transparent' }, pressed && { opacity: 0.7 }]}
    >
      <Ionicons name={icon} size={20} color={color} />
    </Pressable>
  );
}

export function Header({ title, right, onBack }: { title?: string; right?: ReactNode; onBack?: () => void }) {
  return (
    <View style={styles.header}>
      <IconButton icon="chevron-back" onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))} />
      <Txt variant="h3" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>{title}</Txt>
      <View style={{ width: 40, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

// ---------------------------------------------------------------- Score bar
export function ScoreBar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: value / max, duration: 700, useNativeDriver: false }).start();
  }, [value, max, anim]);
  return (
    <View style={styles.scoreRow}>
      <Txt style={{ width: 86, fontSize: 12, color: colors.textSoft }}>{label}</Txt>
      <View style={styles.track}>
        <Animated.View style={{ height: 6, borderRadius: 3, overflow: 'hidden', width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }}>
          <LinearGradient colors={[colors.lavender, colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      </View>
      <Txt variant="gold" style={{ width: 24, textAlign: 'right', fontSize: 12 }}>{value}</Txt>
    </View>
  );
}

// ---------------------------------------------------------------- States
export function Skeleton({ width, height, radius: r = 8, style }: { width: number | `${number}%`; height: number; radius?: number; style?: StyleProp<ViewStyle> }) {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return <Animated.View style={[{ width, height, borderRadius: r, backgroundColor: '#221B3E', opacity: pulse }, style]} />;
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={{ gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Skeleton width={52} height={52} radius={26} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton width="65%" height={12} />
            <Skeleton width="40%" height={10} />
          </View>
        </Card>
      ))}
    </View>
  );
}

export function EmptyState({ icon = 'sparkles-outline', title, text, action, onAction }: { icon?: keyof typeof Ionicons.glyphMap; title: string; text?: string; action?: string; onAction?: () => void }) {
  return (
    <Card style={{ alignItems: 'center', gap: 8, paddingVertical: 28 }}>
      <Ionicons name={icon} size={40} color={colors.lavender} />
      <Txt variant="h3" style={{ textAlign: 'center' }}>{title}</Txt>
      {text ? <Txt variant="muted" style={{ textAlign: 'center' }}>{text}</Txt> : null}
      {action ? <Button title={action} kind="soft" size="sm" onPress={onAction} style={{ marginTop: 8, alignSelf: 'center', paddingHorizontal: 8 }} /> : null}
    </Card>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.error}>
      <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
      <Txt style={{ flex: 1, fontSize: 13 }}>{message}</Txt>
      {onRetry ? (
        <Pressable onPress={onRetry} hitSlop={8}>
          <Txt variant="gold" style={{ fontSize: 12 }}>Дахин</Txt>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.border, alignSelf: 'stretch' }} />;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Txt variant="h3">{title}</Txt>
      {action ? (
        <Pressable hitSlop={8} onPress={onAction}>
          <Txt variant="gold" style={{ fontSize: 12 }}>{action}</Txt>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: 16 },
  badge: { height: 24, paddingHorizontal: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  chip: {
    height: 34, paddingHorizontal: 14, borderRadius: 17, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  error: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.md,
    backgroundColor: '#3D1A24', borderWidth: 1, borderColor: colors.danger,
  },
});
