import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, fonts, gradients, radius } from '@/lib/theme';
import { Txt } from './Txt';

type Kind = 'primary' | 'ghost' | 'danger' | 'soft';

interface Props {
  title: string;
  onPress?: () => void;
  kind?: Kind;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'md' | 'sm';
  style?: StyleProp<ViewStyle>;
}

export function Button({ title, onPress, kind = 'primary', loading, disabled, icon, size = 'md', style }: Props) {
  const h = size === 'sm' ? 40 : 52;
  const textColor = kind === 'primary' ? colors.onGold : kind === 'danger' ? colors.danger : colors.text;
  const inactive = disabled || loading;

  const content = (
    <View style={[styles.inner, { height: h }]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={textColor} />}
          <Txt style={{ color: textColor, fontFamily: kind === 'primary' ? fonts.bold : fonts.semibold, fontSize: size === 'sm' ? 14 : 16 }}>
            {title}
          </Txt>
        </>
      )}
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      disabled={inactive}
      onPress={() => {
        Haptics.selectionAsync();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.base,
        { borderRadius: size === 'sm' ? radius.sm : radius.md, opacity: inactive ? 0.5 : pressed ? 0.85 : 1 },
        kind === 'ghost' && styles.ghost,
        kind === 'danger' && styles.danger,
        kind === 'soft' && styles.soft,
        style,
      ]}
    >
      {kind === 'primary' ? (
        <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      ) : null}
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden', alignSelf: 'stretch' },
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16 },
  ghost: { borderWidth: 1, borderColor: '#3A3163' },
  danger: { borderWidth: 1, borderColor: '#5A2433' },
  soft: { backgroundColor: colors.surfaceHi, borderWidth: 1, borderColor: colors.borderHi },
});
