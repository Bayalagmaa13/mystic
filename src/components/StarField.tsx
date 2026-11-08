import { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

/** Арын дэвсгэр дээр анивчих одод (Animated API, native driver) */
export const StarField = memo(function StarField({ count = 28, height = 420 }: { count?: number; height?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (i * 97.13) % width,
        y: (i * 53.71) % height,
        size: i % 7 === 0 ? 3 : i % 3 === 0 ? 2 : 1.4,
        delay: (i * 233) % 2400,
      })),
    [count, height],
  );
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { height }]}>
      {stars.map((s, i) => (
        <Star key={i} {...s} />
      ))}
    </View>
  );
});

function Star({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  const o = useRef(new Animated.Value(0.2)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(o, { toValue: 0.9, duration: 1400, useNativeDriver: true }),
        Animated.timing(o, { toValue: 0.2, duration: 1400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [o, delay]);
  return (
    <Animated.View
      style={{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size, backgroundColor: '#F4F0FF', opacity: o }}
    />
  );
}
