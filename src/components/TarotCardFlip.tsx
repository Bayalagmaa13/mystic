import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, fonts } from '@/lib/theme';
import type { TarotCard } from '@/lib/tarot';
import { Txt } from './Txt';

interface Props {
  card: TarotCard | null; // null бол нүүрээрээ доош
  reversed?: boolean;
  revealed: boolean;
  onPress?: () => void;
  width?: number;
}

/**
 * «Өдрийн хөзөр» — дарахад 3D хэлбэрээр эргэнэ.
 * rotateY 0° → 180°: ар тал нь алга болж, нүүр тал гарч ирнэ (backfaceVisibility: hidden).
 */
export function TarotCardFlip({ card, reversed, revealed, onPress, width = 132 }: Props) {
  const height = width * 1.6;
  const flip = useRef(new Animated.Value(revealed ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(flip, { toValue: revealed ? 1 : 0, friction: 7, tension: 40, useNativeDriver: true }).start();
    if (revealed) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [revealed, flip]);

  const backRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const frontRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  return (
    <Pressable onPress={onPress} disabled={revealed} style={{ width, height }}>
      {/* Ар тал */}
      <Animated.View style={[styles.face, { width, height, transform: [{ perspective: 900 }, { rotateY: backRotate }] }]}>
        <LinearGradient colors={['#3A2A6E', '#1A1530']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, styles.center]}>
          <View style={[styles.innerBorder, { width: width - 16, height: height - 16 }]}>
            <Ionicons name="moon" size={30} color={colors.gold} />
            <Ionicons name="sparkles" size={16} color={colors.lavender} style={{ marginTop: 6 }} />
            <Txt variant="small" style={{ marginTop: 10, color: colors.textSoft }}>Дарж эргүүл</Txt>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Нүүр тал */}
      <Animated.View style={[styles.face, { width, height, transform: [{ perspective: 900 }, { rotateY: frontRotate }] }]}>
        <LinearGradient colors={['#F4E3B8', '#E8C27A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, styles.center]}>
          <View style={[styles.innerBorder, { width: width - 16, height: height - 16, borderColor: '#1A102855' }, reversed && { transform: [{ rotate: '180deg' }] }]}>
            <Txt style={{ color: colors.onGold, fontFamily: fonts.display, fontSize: 16 }}>{card?.roman}</Txt>
            <Ionicons name={(card?.icon as keyof typeof Ionicons.glyphMap) ?? 'star'} size={44} color={colors.onGold} style={{ marginVertical: 12 }} />
            <Txt style={{ color: colors.onGold, fontFamily: fonts.semibold, fontSize: 13, textAlign: 'center' }}>{card?.name}</Txt>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  face: { position: 'absolute', borderRadius: 14, overflow: 'hidden', backfaceVisibility: 'hidden', borderWidth: 1, borderColor: colors.gold },
  center: { alignItems: 'center', justifyContent: 'center' },
  innerBorder: { borderWidth: 1, borderColor: '#E8C27A66', borderRadius: 10, alignItems: 'center', justifyContent: 'center', padding: 8 },
});
