import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOutUp,
  ZoomIn,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvatarStack, Button, Icon, Text } from '@/components/ui';
import { borderWidth, fills, fonts, hardShadow, type FillName } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

const WORDS: { word: string; fill: FillName }[] = [
  { word: 'planes', fill: 'lilac' },
  { word: 'rutas', fill: 'lime' },
  { word: 'viajes', fill: 'sky' },
];

/** Tarjeta de ejemplo que cae rotada y luego flota. */
function FloatCard({ style, rotate, delay, fill, children }: { style: ViewStyle; rotate: number; delay: number; fill: FillName; children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const y = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    y.set(withDelay(delay + 900, withRepeat(withSequence(withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }), withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })), -1)));
    return () => cancelAnimation(y);
  }, [reduced, delay, y]);
  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));
  return (
    <Animated.View entering={reduced ? undefined : FadeInDown.delay(delay).springify().damping(11)} style={[{ position: 'absolute' }, style]}>
      <Animated.View
        style={[
          {
            transform: [{ rotate: `${rotate}deg` }],
            backgroundColor: fills[fill],
            borderWidth,
            borderColor: fills.onFill,
            borderRadius: 20,
            padding: 12,
            gap: 8,
            boxShadow: hardShadow('lg', fills.onFill),
          },
          floatStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}

function CardHead({ label, icon }: { label: string; icon: 'celebration' | 'directions_car' | 'landscape' | 'sports_soccer' }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 0.9 }} tone="onFill">
        {label}
      </Text>
      <Icon name={icon} size={20} color={fills.onFill} />
    </View>
  );
}

function CardTitle({ children }: { children: string }) {
  return (
    <Text style={{ fontFamily: fonts.display, fontSize: 19, lineHeight: 20 }} tone="onFill" maxFontSizeMultiplier={1.2}>
      {children}
    </Text>
  );
}

export default function Welcome() {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const spin = useSharedValue(0);
  const marquee = useSharedValue(0);
  const [bandWidth, setBandWidth] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setI((n) => (n + 1) % WORDS.length), 2200);
    spin.set(withRepeat(withTiming(360, { duration: 30000, easing: Easing.linear }), -1));
    return () => {
      clearInterval(t);
      cancelAnimation(spin);
    };
  }, [reduced, spin]);

  useEffect(() => {
    if (reduced || !bandWidth) return;
    marquee.set(withRepeat(withTiming(-bandWidth, { duration: 14000, easing: Easing.linear }), -1));
    return () => cancelAnimation(marquee);
  }, [reduced, bandWidth, marquee]);

  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.get()}deg` }] }));
  const marqueeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: marquee.get() }] }));
  const w = WORDS[i];
  const band = 'EVENTOS ✦ WHEELS ✦ TOURS ✦ CORREO VERIFICADO ✦ ';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingTop: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }} accessible accessibilityLabel="Junto" accessibilityRole="header">
          <Image source={require('@/assets/images/icon.png')} style={{ width: 38, height: 38, borderRadius: 11, borderWidth, borderColor: colors.border, boxShadow: hardShadow('sm', colors.shadow) }} />
          <Image source={require('@/assets/images/wordmark.png')} style={{ width: 70, height: 30 }} contentFit="contain" tintColor={colors.foreground} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth, borderColor: colors.border, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 11 }}>
          <Icon name="verified" size={16} color={colors.foreground} />
          <Text style={{ fontFamily: fonts.semibold, fontSize: 12 }}>Solo El Bosque</Text>
        </View>
      </View>

      {/* Tablero de tarjetas de ejemplo (decorativo) */}
      <View style={{ height: 300, marginTop: 6 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Animated.View
          style={[
            { position: 'absolute', left: '50%', top: '50%', width: 240, height: 240, marginLeft: -120, marginTop: -120, borderWidth, borderStyle: 'dashed', borderColor: colors.shadow, borderRadius: 999 },
            spinStyle,
          ]}
        />
        <FloatCard style={{ left: 18, top: 22, width: 196 }} rotate={-7} delay={250} fill="lilac">
          <CardHead label="EVENTO · HOY 5PM" icon="sports_soccer" />
          <CardTitle>Fútbol 6 — nos falta uno</CardTitle>
          <AvatarStack people={[{ name: 'Mateo' }, { name: 'Laura' }, { name: 'Sara' }]} total={12} max={2} />
        </FloatCard>
        <FloatCard style={{ right: 14, top: 104, width: 184 }} rotate={6} delay={450} fill="lime">
          <CardHead label="WHEELS · PRONTO" icon="directions_car" />
          <CardTitle>Chapinero → Campus</CardTitle>
        </FloatCard>
        <FloatCard style={{ left: 34, top: 190, width: 200 }} rotate={-3} delay={650} fill="sky">
          <CardHead label="TOURS · PRONTO" icon="landscape" />
          <CardTitle>Guatavita + laguna</CardTitle>
        </FloatCard>
        <Animated.View
          entering={reduced ? undefined : ZoomIn.delay(1250).springify().damping(9)}
          style={{
            position: 'absolute',
            right: 48,
            bottom: 14,
            transform: [{ rotate: '-10deg' }],
            backgroundColor: fills.coral,
            borderWidth,
            borderColor: fills.onFill,
            borderRadius: 12,
            paddingVertical: 6,
            paddingHorizontal: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            boxShadow: hardShadow('md', fills.onFill),
          }}
        >
          <Icon name="verified" size={16} color={fills.onFill} />
          <Text style={{ fontFamily: fonts.bold, fontSize: 12 }} tone="onFill">
            100% estudiantes
          </Text>
        </Animated.View>
      </View>

      {/* Titular */}
      <View style={{ paddingHorizontal: 22 }} accessible accessibilityRole="header" accessibilityLabel="Arma planes, rutas y viajes con tu U.">
        <Text variant="display">Arma</Text>
        <View style={{ height: 56, justifyContent: 'center', alignItems: 'flex-start' }}>
          <Animated.View key={w.word} entering={reduced ? undefined : FadeInDown.springify().damping(14)} exiting={reduced ? undefined : FadeOutUp.duration(200)}>
            <View style={{ backgroundColor: fills[w.fill], borderWidth, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 12, boxShadow: hardShadow('md', colors.shadow) }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 44, lineHeight: 52, letterSpacing: -1.5 }} tone="onFill" maxFontSizeMultiplier={1.2}>
                {w.word}
              </Text>
            </View>
          </Animated.View>
        </View>
        <Text variant="display">con tu U.</Text>
      </View>

      {/* Franja que se desplaza */}
      <Animated.View
        entering={reduced ? undefined : FadeIn.delay(400)}
        style={{ marginTop: 16, marginHorizontal: -10, transform: [{ rotate: '-3deg' }], backgroundColor: colors.foreground, borderTopWidth: borderWidth, borderBottomWidth: borderWidth, borderColor: colors.border, paddingVertical: 9, overflow: 'hidden' }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Animated.View style={[{ flexDirection: 'row' }, marqueeStyle]}>
          {[0, 1, 2].map((k) => (
            <Text key={k} onLayout={k === 0 ? (e) => setBandWidth(e.nativeEvent.layout.width) : undefined} style={{ fontFamily: fonts.bold, fontSize: 13, letterSpacing: 1.8 }} color={colors.background} numberOfLines={1}>
              {band + band}
            </Text>
          ))}
        </Animated.View>
      </Animated.View>

      <View style={{ flex: 1 }} />
      <View style={{ paddingHorizontal: 22, paddingBottom: 16, gap: 12 }}>
        <Button label="Crear cuenta con mi correo U" iconRight="arrow_forward" variant="accent" large onPress={() => router.push('/register')} />
        <Button label="Ya tengo cuenta" variant="secondary" onPress={() => router.push('/login')} />
      </View>
    </SafeAreaView>
  );
}
