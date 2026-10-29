import { Pressable, View } from 'react-native';

import { Icon, type IconName } from './Icon';
import { IconButton } from './Button';
import { Text } from './Text';
import { borderWidth, fills, hardShadow, type FillName } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

/** Chip seleccionable (intereses, categorías, motivos, filtros). */
export function Chip({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress?: () => void; icon?: IconName }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 6, bottom: 6 }}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={onPress ? { selected: !!selected } : undefined}
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth,
        borderColor: colors.border,
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: selected ? fills.lilac : 'transparent',
        boxShadow: selected ? hardShadow('sm', colors.shadow) : undefined,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {icon ? <Icon name={icon} size="sm" color={selected ? fills.onFill : colors.foreground} /> : null}
      <Text variant="chip" color={selected ? fills.onFill : colors.foreground}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Etiqueta píldora con relleno pastel (cupos, estados). */
export function Tag({ label, fill = 'mint', icon, soon }: { label: string; fill?: FillName; icon?: IconName; soon?: boolean }) {
  const { colors } = useTheme();
  const fg = soon ? colors.mutedForeground : fills.onFill;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        borderWidth,
        borderColor: colors.border,
        borderRadius: 999,
        paddingVertical: 5,
        paddingHorizontal: 12,
        backgroundColor: soon ? colors.muted : fills[fill],
      }}
    >
      {icon ? <Icon name={icon} size={16} color={fg} /> : null}
      <Text variant="tag" color={fg} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

type SegOption<T extends string> = { value: T; label: string; icon?: IconName };

/** Control segmentado (Todo mi campus / Apruebo yo, tema, pestañas de Mis planes). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={{ flexDirection: 'row', borderWidth, borderColor: colors.border, borderRadius: 999, padding: 3, gap: 3, backgroundColor: colors.card }}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            style={{
              flex: 1,
              minHeight: 44,
              borderRadius: 999,
              paddingHorizontal: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              backgroundColor: on ? colors.primary : 'transparent',
            }}
          >
            {o.icon ? <Icon name={o.icon} size="sm" color={on ? colors.primaryForeground : colors.foreground} /> : null}
            <Text variant="chip" style={{ fontFamily: 'Lexend_600SemiBold' }} color={on ? colors.primaryForeground : colors.foreground} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Fila con interruptor: toda la fila es el control (área ≥ 48). */
export function ToggleRow({
  label,
  subtitle,
  icon,
  value,
  onChange,
}: {
  label: string;
  subtitle?: string;
  icon?: IconName;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      accessibilityHint={subtitle}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 }}
    >
      {icon ? <Icon name={icon} /> : null}
      <View style={{ flex: 1 }}>
        <Text variant="title">{label}</Text>
        {subtitle ? (
          <Text variant="small" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View
        style={{
          width: 50,
          height: 30,
          borderRadius: 999,
          borderWidth,
          borderColor: colors.border,
          backgroundColor: value ? fills.mint : colors.muted,
          justifyContent: 'center',
          paddingHorizontal: 3,
        }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 999,
            backgroundColor: value ? fills.onFill : colors.foreground,
            alignSelf: value ? 'flex-end' : 'flex-start',
          }}
        />
      </View>
    </Pressable>
  );
}

/** Casilla con texto (autorización de datos). El texto puede incluir enlaces. */
export function Checkbox({ checked, onChange, children, label }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode; label: string }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, minHeight: 48 }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          marginTop: 2,
          borderRadius: 8,
          borderWidth,
          borderColor: colors.border,
          backgroundColor: checked ? fills.lilac : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked ? <Icon name="check" size="sm" color={fills.onFill} /> : null}
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </Pressable>
  );
}

/** Valor con botones − / + (cupos). accessibilityRole adjustable. */
export function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value, text: String(value) }}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'increment') onChange(Math.min(max, value + 1));
        if (e.nativeEvent.actionName === 'decrement') onChange(Math.max(min, value - 1));
      }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
    >
      <View>
        <Text variant="label">{label}</Text>
        <Text variant="stat" tabular>
          {value}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <IconButton icon="remove" label={`Menos ${label.toLowerCase()}`} onPress={() => onChange(Math.max(min, value - 1))} disabled={value <= min} />
        <IconButton icon="add" label={`Más ${label.toLowerCase()}`} onPress={() => onChange(Math.min(max, value + 1))} disabled={value >= max} />
      </View>
    </View>
  );
}

/** 5 estrellas. Llena = color star; vacía = contorno muted (contraste corregido). */
export function Stars({ value, onChange, label }: { value: number; onChange?: (v: number) => void; label: string }) {
  const { colors } = useTheme();
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min: 1, max: 5, now: value, text: `${value} de 5` }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        if (!onChange) return;
        if (e.nativeEvent.actionName === 'increment') onChange(Math.min(5, value + 1));
        if (e.nativeEvent.actionName === 'decrement') onChange(Math.max(1, value - 1));
      }}
      style={{ flexDirection: 'row', gap: 4 }}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={onChange ? () => onChange(n) : undefined} hitSlop={4} importantForAccessibility="no">
          <Icon name={n <= value ? 'star' : 'star_outline'} size={40} color={n <= value ? colors.star : colors.mutedForeground} />
        </Pressable>
      ))}
    </View>
  );
}
