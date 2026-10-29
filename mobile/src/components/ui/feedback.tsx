import { useEffect } from 'react';
import { Modal, Pressable, View } from 'react-native';
import Animated, { FadeIn, SlideInDown, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, IconButton } from './Button';
import { Icon, type IconName } from './Icon';
import { Pop } from './motion';
import { Text } from './Text';
import { borderWidth, fills, hardShadow, radius, size, type FillName } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

/** Aviso en línea con relleno pastel (carné en revisión, sin conexión…). */
export function Banner({ icon, fill, title, body, action }: { icon: IconName; fill: FillName; title: string; body?: string; action?: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="alert"
      style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 14, borderRadius: radius.md, borderWidth, borderColor: colors.border, backgroundColor: fills[fill] }}
    >
      <Icon name={icon} color={fills.onFill} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="title" tone="onFill">
          {title}
        </Text>
        {body ? (
          <Text variant="small" tone="onFill">
            {body}
          </Text>
        ) : null}
        {action}
      </View>
    </View>
  );
}

/** Icono de estado de 96 en relleno pastel. */
export function StatusIcon({ icon, fill }: { icon: IconName; fill: FillName }) {
  const { colors } = useTheme();
  return (
    <Pop>
      <View
        style={{
          width: size.statusIcon,
          height: size.statusIcon,
          borderRadius: 999,
          borderWidth,
          borderColor: colors.border,
          backgroundColor: fills[fill],
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: hardShadow('lg', colors.shadow),
          alignSelf: 'center',
        }}
      >
        <Icon name={icon} size={48} color={fills.onFill} />
      </View>
    </Pop>
  );
}

type Action = { label: string; onPress: () => void; icon?: IconName };

/** Estado límite: qué pasó · qué significa · dos salidas (principio común del producto). */
export function StateBlock({ icon, fill, title, body, primary, secondary, extra }: { icon: IconName; fill: FillName; title: string; body: string; primary?: Action; secondary?: Action; extra?: React.ReactNode }) {
  return (
    <View style={{ gap: 18, alignItems: 'stretch' }}>
      <StatusIcon icon={icon} fill={fill} />
      <Text variant="h1" center>
        {title}
      </Text>
      <Text tone="muted" center>
        {body}
      </Text>
      {extra}
      {primary ? <Button label={primary.label} icon={primary.icon} onPress={primary.onPress} /> : null}
      {secondary ? <Button label={secondary.label} icon={secondary.icon} variant="secondary" onPress={secondary.onPress} /> : null}
    </View>
  );
}

/** Bloque de carga con la forma del contenido. Late suavemente salvo con movimiento reducido. */
export function Skeleton({ height = 80, radius: r = radius.lg }: { height?: number; radius?: number }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const o = useSharedValue(1);
  useEffect(() => {
    if (!reduced) o.set(withRepeat(withTiming(0.5, { duration: 700 }), -1, true));
  }, [reduced, o]);
  const style = useAnimatedStyle(() => ({ opacity: o.get() }));
  return <Animated.View accessibilityLabel="Cargando" style={[{ height, borderRadius: r, backgroundColor: colors.muted }, style]} />;
}

/** Tarjeta de error con causa y reintento. */
export function ErrorCard({ message = 'No pudimos cargar esto. Revisa tu conexión.', onRetry }: { message?: string; onRetry?: () => void }) {
  return <Banner icon="error" fill="coral" title="Algo salió mal" body={message} action={onRetry ? <View style={{ marginTop: 8 }}><Button label="Reintentar" icon="refresh" variant="secondary" onPress={onRetry} /></View> : undefined} />;
}

/** Hoja inferior con scrim, asa y botón cerrar. */
export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View entering={FadeIn.duration(300)} style={{ position: 'absolute', inset: 0, backgroundColor: colors.scrim }}>
          <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar" />
        </Animated.View>
        <Animated.View
          entering={reduced ? FadeIn.duration(150) : SlideInDown.springify().damping(18)}
          accessibilityViewIsModal
          style={{
            maxHeight: '84%',
            backgroundColor: colors.background,
            borderTopWidth: borderWidth,
            borderColor: colors.border,
            borderTopLeftRadius: radius.sheet,
            borderTopRightRadius: radius.sheet,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 28 + insets.bottom,
            gap: 14,
          }}
        >
          <View style={{ width: 48, height: 5, borderRadius: 999, backgroundColor: colors.mutedForeground, alignSelf: 'center' }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Text variant="h2" style={{ flex: 1 }}>
              {title}
            </Text>
            <IconButton icon="close" label="Cerrar" onPress={onClose} />
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
