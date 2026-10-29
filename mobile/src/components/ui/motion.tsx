import Animated, { FadeIn, FadeInDown, ZoomIn, useReducedMotion } from 'react-native-reanimated';
import type { StyleProp, ViewStyle } from 'react-native';

import { motion } from '@/theme/tokens';

/**
 * Entrada escalonada de bloques de pantalla (sube y aparece con rebote leve).
 * Con movimiento reducido no anima.
 */
export function Enter({ index = 0, children, style }: { index?: number; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const delay = Math.min(index * motion.stagger.step, motion.stagger.max);
  return (
    <Animated.View
      entering={reduced ? undefined : FadeInDown.delay(delay).springify().damping(16).mass(0.8)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

/** Aparición tipo "pop" para iconos de estado, chips y avatares. */
export function Pop({ delay = 0, children, style }: { delay?: number; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  return (
    <Animated.View entering={reduced ? FadeIn.duration(motion.duration.micro) : ZoomIn.delay(delay).springify().damping(9)} style={style}>
      {children}
    </Animated.View>
  );
}
