import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import Animated, { ZoomIn, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Icon, IconTile, Raised, Sheet, Tag, Text, type IconName } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { borderWidth, fills, hardShadow, layout, size, type FillName } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

type TabName = 'home' | 'events' | 'wheels' | 'tours' | 'mine';

const BAR_PADDING = 6;

const TABS: Record<TabName, { label: string; icon: IconName; fill?: FillName }> = {
  home: { label: 'Inicio', icon: 'home' },
  events: { label: 'Eventos', icon: 'celebration', fill: 'lilac' },
  wheels: { label: 'Wheels', icon: 'directions_car', fill: 'lime' },
  tours: { label: 'Tours', icon: 'landscape', fill: 'sky' },
  mine: { label: 'Mis planes', icon: 'event_note' },
};

const SOON: Record<'wheels' | 'tours', { title: string; body: string }> = {
  wheels: { title: 'Pronto podrás publicar tu ruta', body: 'Wheels abre cuando haya suficientes estudiantes en tu campus. Te avisamos.' },
  tours: { title: 'Pronto podrás armar un viaje', body: 'Tours llega después de Wheels. Te avisamos cuando abra.' },
};

/** Barra de 5 pestañas + burbuja "+" flotando sobre Mis planes (DESIGN.md · bottom-nav, create-fab). */
export function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const { width } = useWindowDimensions();
  const { me } = useAuth();
  const [sheet, setSheet] = useState<null | 'choose' | 'wheels' | 'tours' | 'unverified'>(null);

  const current = state.routes[state.index]?.name as TabName;
  const showFab = current !== 'mine';
  const approved = me?.verification === 'approved';

  const onCreate = () => {
    if (current === 'wheels' || current === 'tours') return setSheet(current);
    if (!approved) return setSheet('unverified');
    if (current === 'home') return setSheet('choose');
    router.push('/events/create');
  };

  const fabHint = { home: 'Elegir qué crear', events: 'Crear un evento', wheels: 'Wheels abre pronto', tours: 'Tours abre pronto', mine: '' }[current];

  return (
    <View>
      {showFab ? (
        <Animated.View
          key={current}
          entering={reduced ? undefined : ZoomIn.springify().damping(12)}
          style={{
            position: 'absolute',
            bottom: layout.tabBarHeight + insets.bottom + layout.fabGap,
            // Centrada sobre la pestaña Mis planes: la última de 5 pestañas iguales,
            // con 6 de margen lateral en la barra.
            right: BAR_PADDING + (width - BAR_PADDING * 2) / 10 - layout.fabSize / 2,
          }}
        >
          <Raised
            onPress={onCreate}
            elevation="md"
            bg={colors.primary}
            radius={999}
            accessibilityLabel="Crear"
            accessibilityHint={fabHint}
            style={{ width: layout.fabSize, height: layout.fabSize, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="add" size={30} color={colors.primaryForeground} />
          </Raised>
        </Animated.View>
      ) : null}

      <View
        accessibilityRole="tablist"
        style={{
          flexDirection: 'row',
          borderTopWidth: borderWidth,
          borderColor: colors.border,
          backgroundColor: colors.card,
          paddingTop: 8,
          paddingBottom: insets.bottom + 8,
          paddingHorizontal: BAR_PADDING,
          minHeight: layout.tabBarHeight + insets.bottom,
        }}
      >
        {state.routes.map((route, i) => {
          const tab = TABS[route.name as TabName];
          if (!tab) return null;
          const focused = state.index === i;
          const onPress = () => {
            const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };
          const indicatorBg = focused ? (tab.fill ? fills[tab.fill] : colors.primary) : 'transparent';
          const iconColor = focused ? (tab.fill ? fills.onFill : colors.primaryForeground) : colors.mutedForeground;
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.label}
              style={{ flex: 1, alignItems: 'center', gap: 4, minHeight: 48 }}
            >
              <View
                style={{
                  width: size.tabIndicator.width,
                  height: size.tabIndicator.height,
                  borderRadius: 999,
                  borderWidth,
                  borderColor: focused ? colors.border : 'transparent',
                  backgroundColor: indicatorBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: focused ? hardShadow('sm', colors.shadow) : undefined,
                }}
              >
                <Icon name={tab.icon} color={iconColor} />
              </View>
              <Text variant="nav" color={focused ? colors.foreground : colors.mutedForeground} numberOfLines={1}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Sheet visible={sheet === 'choose'} onClose={() => setSheet(null)} title="¿Qué quieres crear?">
        <CreateOption icon="celebration" fill="lilac" title="Evento" subtitle="Un plan para tu campus" onPress={() => { setSheet(null); router.push('/events/create'); }} />
        <CreateOption icon="directions_car" title="Ruta Wheels" subtitle="Comparte tus puestos" soon onPress={() => setSheet('wheels')} />
        <CreateOption icon="landscape" title="Tour" subtitle="Un viaje en grupo" soon onPress={() => setSheet('tours')} />
      </Sheet>
      {(['wheels', 'tours'] as const).map((m) => (
        <Sheet key={m} visible={sheet === m} onClose={() => setSheet(null)} title={SOON[m].title}>
          <Text tone="muted">{SOON[m].body}</Text>
          <Button label="Entendido" onPress={() => setSheet(null)} />
        </Sheet>
      ))}
      <Sheet visible={sheet === 'unverified'} onClose={() => setSheet(null)} title="Aún estamos revisando tu carné">
        <Text tone="muted">Podrás crear planes cuando lo aprobemos. Tarda menos de 24 h.</Text>
        <Button label="Entendido" onPress={() => setSheet(null)} />
      </Sheet>
    </View>
  );
}

function CreateOption({ icon, fill, title, subtitle, soon, onPress }: { icon: IconName; fill?: FillName; title: string; subtitle: string; soon?: boolean; onPress: () => void }) {
  return (
    <Card row onPress={onPress} label={title} hint={soon ? 'Disponible pronto' : undefined}>
      <IconTile icon={icon} fill={fill} muted={soon} />
      <View style={{ flex: 1 }}>
        <Text variant="title" tone={soon ? 'muted' : 'default'}>
          {title}
        </Text>
        <Text variant="small" tone="muted">
          {subtitle}
        </Text>
      </View>
      {soon ? <Tag label="Pronto" soon /> : <Icon name="chevron_right" />}
    </Card>
  );
}
