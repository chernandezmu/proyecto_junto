import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { Button, Icon, Sheet, Text } from '@/components/ui';
import { borderWidth, radius, size } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

type Props = {
  label: string;
  value: Date | null;
  onChange: (d: Date) => void;
  mode?: 'date' | 'time';
  placeholder: string;
  format: (d: Date) => string;
  minimumDate?: Date;
  maximumDate?: Date;
  helper?: string;
  error?: string | null;
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Date → valor de <input type="date|time"> (hora local). */
function toInputValue(d: Date, mode: 'date' | 'time') {
  return mode === 'date' ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Valor del <input> → Date, conservando la otra mitad (hora o fecha) de `base`. */
function fromInputValue(v: string, mode: 'date' | 'time', base: Date) {
  const nums = v.split(/[-:]/).map(Number);
  if (!v || nums.some((n) => Number.isNaN(n))) return null;
  const d = new Date(base);
  if (mode === 'date') d.setFullYear(nums[0], nums[1] - 1, nums[2]);
  else d.setHours(nums[0], nums[1], 0, 0);
  return d;
}

/** Campo que abre el selector nativo (diálogo en Android, hoja con rueda en iPhone, selector del navegador en la web). */
export function DateField({ label, value, onChange, mode = 'date', placeholder, format, minimumDate, maximumDate, helper, error }: Props) {
  const { colors, scheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value ?? maximumDate ?? new Date());

  const show = () => {
    if (Platform.OS === 'web') return; // lo abre el <input> de abajo
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: value ?? maximumDate ?? new Date(),
        mode,
        minimumDate,
        maximumDate,
        is24Hour: false,
        onValueChange: (_e, d) => d && onChange(d),
      });
    } else {
      setDraft(value ?? maximumDate ?? new Date());
      setOpen(true);
    }
  };

  return (
    <View style={{ gap: 6, flex: 1 }}>
      <Text variant="label">{label}</Text>
      <Pressable
        onPress={show}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? format(value) : 'sin elegir'}`}
        accessibilityHint={error ?? helper}
        style={{
          minHeight: size.field,
          borderWidth,
          borderRadius: radius.md,
          borderColor: error ? colors.destructiveText : colors.border,
          backgroundColor: colors.card,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <Text tone={value ? 'default' : 'muted'} numberOfLines={1} style={{ flex: 1 }}>
          {value ? format(value) : placeholder}
        </Text>
        <Icon name={mode === 'date' ? 'calendar_month' : 'schedule'} />
        {Platform.OS === 'web' ? (
          // En la web, un <input> nativo e invisible encima del campo abre el selector del navegador.
          <input
            type={mode}
            aria-label={label}
            value={value ? toInputValue(value, mode) : ''}
            min={mode === 'date' && minimumDate ? toInputValue(minimumDate, 'date') : undefined}
            max={mode === 'date' && maximumDate ? toInputValue(maximumDate, 'date') : undefined}
            onClick={(e) => {
              try {
                e.currentTarget.showPicker?.();
              } catch {
                // Navegadores sin showPicker: el clic sobre el input ya lo abre.
              }
            }}
            onChange={(e) => {
              const d = fromInputValue(e.currentTarget.value, mode, value ?? new Date());
              if (d) onChange(d);
            }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, border: 0, margin: 0, padding: 0, cursor: 'pointer', colorScheme: scheme }}
          />
        ) : null}
      </Pressable>
      {error ? (
        <Text variant="small" tone="danger">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="small" tone="muted">
          {helper}
        </Text>
      ) : null}
      {Platform.OS === 'ios' ? (
        <Sheet visible={open} onClose={() => setOpen(false)} title={label}>
          <DateTimePicker
            value={draft}
            mode={mode}
            display="spinner"
            locale="es-CO"
            themeVariant={scheme}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onValueChange={(_e, d) => d && setDraft(d)}
          />
          <Button
            label="Listo"
            onPress={() => {
              onChange(draft);
              setOpen(false);
            }}
          />
        </Sheet>
      ) : null}
    </View>
  );
}
