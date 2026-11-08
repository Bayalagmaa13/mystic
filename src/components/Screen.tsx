import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/lib/theme';
import { StarField } from './StarField';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  glow?: boolean; // дээд талын нил ягаан туяа + од
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
  refreshing?: boolean;
  onRefresh?: () => void;
  footer?: ReactNode; // доод талд тогтмол байх товч
}

/** Бүх дэлгэцийн суурь: safe area, арын градиент, гүйлгэх, гарнаас зайлсхийх */
export function Screen({ children, scroll, glow, edges = ['top'], contentStyle, refreshing, onRefresh, footer }: Props) {
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.gold} colors={[colors.gold]} progressBackgroundColor={colors.surface} /> : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, { flex: 1 }, contentStyle]}>{children}</View>
  );

  return (
    <View style={styles.root}>
      {glow ? (
        <>
          <LinearGradient colors={['#2E2260', colors.bg]} start={{ x: 0.9, y: 0 }} end={{ x: 0.3, y: 0.55 }} style={StyleSheet.absoluteFill} />
          <StarField />
        </>
      ) : null}
      <SafeAreaView edges={edges} style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {body}
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28, gap: 16 },
  footer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16, gap: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg },
});
