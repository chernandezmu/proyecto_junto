import { useState, type ComponentRef, type Ref } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { Icon } from './Icon';
import { Text } from './Text';
import { borderWidth, fonts, hardShadow, radius, size } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

type Props = TextInputProps & {
  label?: string;
  helper?: string;
  error?: string | null;
  multiline?: boolean;
  ref?: Ref<ComponentRef<typeof TextInput>>;
};

/** Campo de texto con etiqueta visible, ayuda y error junto al campo (causa + solución). */
export function Field({ label, helper, error, multiline, style, ref, ...rest }: Props) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text variant="label">{label}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.mutedForeground}
        selectionColor={colors.foreground}
        accessibilityLabel={label ?? rest.placeholder}
        accessibilityHint={error ?? helper}
        maxFontSizeMultiplier={2}
        multiline={multiline}
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[
          {
            minHeight: multiline ? 112 : size.field,
            borderWidth,
            borderRadius: radius.md,
            borderColor: error ? colors.destructiveText : colors.border,
            backgroundColor: colors.card,
            color: colors.foreground,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontFamily: fonts.regular,
            fontSize: 16,
            textAlignVertical: multiline ? 'top' : 'center',
            boxShadow: focused ? hardShadow('md', colors.shadow) : undefined,
          },
          style,
        ]}
      />
      {error ? (
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start' }} accessibilityLiveRegion="polite">
          <Icon name="error" size="sm" color={colors.destructiveText} />
          <Text variant="small" tone="danger" style={{ flex: 1, fontFamily: fonts.medium }}>
            {error}
          </Text>
        </View>
      ) : helper ? (
        <Text variant="small" tone="muted">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
