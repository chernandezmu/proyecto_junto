import { router } from 'expo-router';
import { Children, isValidElement } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from './Avatar';
import { IconButton } from './Button';
import { Enter } from './motion';
import { Text } from './Text';
import { layout } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

type ScreenProps = {
  children: React.ReactNode;
  /** Pantalla raíz de pestaña: sin borde inferior seguro (lo pone la barra) y con hueco para la burbuja "+". */
  tab?: boolean;
  fabClearance?: boolean;
  scroll?: boolean;
  center?: boolean;
  animate?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Armazón de pantalla: fondo del tema, zonas seguras, margen de 20, separación de 16,
 * ancho máximo de 560 en tablet y entrada escalonada de cada bloque hijo.
 */
export function Screen({ children, tab, fabClearance, scroll = true, center, animate = true, refreshing, onRefresh, contentStyle }: ScreenProps) {
  const { colors } = useTheme();
  const blocks = Children.toArray(children).map((child, i) =>
    animate && isValidElement(child) && child.type !== Spacer ? (
      <Enter key={(child.key as string) ?? i} index={i}>
        {child}
      </Enter>
    ) : (
      child
    ),
  );
  const inner: ViewStyle = {
    flexGrow: 1,
    paddingHorizontal: layout.screenX,
    paddingTop: 6,
    paddingBottom: (tab ? 16 : layout.screenBottom) + (fabClearance ? layout.fabClearance : 0),
    gap: layout.sectionGap,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    justifyContent: center ? 'center' : undefined,
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={tab ? ['top'] : ['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={[inner, contentStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.foreground} /> : undefined}
          >
            {blocks}
          </ScrollView>
        ) : (
          <View style={[inner, { flex: 1 }, contentStyle]}>{blocks}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Empuja lo que sigue al fondo de la pantalla (botón de acción abajo). */
export function Spacer() {
  return <View style={{ flex: 1, minHeight: 8 }} />;
}

/** Cabecera de pantalla interior: atrás · centro · derecha (o hueco de 44). */
export function Header({
  center,
  right,
  onBack,
  backIcon = 'arrow_back',
  backLabel = 'Volver',
}: {
  center?: React.ReactNode;
  right?: React.ReactNode;
  onBack?: () => void;
  backIcon?: 'arrow_back' | 'close';
  backLabel?: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 4 }}>
      <IconButton icon={backIcon} label={backLabel} onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/home')))} />
      <View style={{ flex: 1, alignItems: 'center' }}>{typeof center === 'string' ? <Text variant="label">{center}</Text> : center}</View>
      {right ?? <View style={{ width: 44 }} />}
    </View>
  );
}

/** Cabecera de pestaña raíz: título (o logo) a la izquierda, avatar a la derecha. */
export function RootHeader({ title, left, name, photoUrl }: { title?: string; left?: React.ReactNode; name: string; photoUrl?: string | null }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 4, minHeight: 48 }}>
      <View style={{ flex: 1 }}>{left ?? <Text variant="h1Sm">{title}</Text>}</View>
      <Avatar name={name} photoUrl={photoUrl} onPress={() => router.push('/me')} label="Abrir mi perfil" />
    </View>
  );
}

/** Fila horizontal con separación de 8 (o la que se pida). */
export function Row({ children, gap = 8, wrap, justify, style }: { children: React.ReactNode; gap?: number; wrap?: boolean; justify?: ViewStyle['justifyContent']; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap, flexWrap: wrap ? 'wrap' : 'nowrap', justifyContent: justify }, style]}>{children}</View>;
}

export function Stack({ children, gap = 8, style }: { children: React.ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ gap }, style]}>{children}</View>;
}
