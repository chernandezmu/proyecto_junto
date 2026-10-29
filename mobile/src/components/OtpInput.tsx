import { useRef, type ComponentRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Text } from '@/components/ui';
import { borderWidth, fonts, hardShadow, radius } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

/**
 * Código de un solo uso. Un único TextInput real (se puede pegar y autocompletar desde
 * el correo/SMS); las casillas son solo visuales.
 */
export function OtpInput({ value, onChange, length = 6, autoFocus, error }: { value: string; onChange: (v: string) => void; length?: number; autoFocus?: boolean; error?: boolean }) {
  const { colors } = useTheme();
  const ref = useRef<ComponentRef<typeof TextInput>>(null);
  const digits = value.split('');
  return (
    <Pressable onPress={() => ref.current?.focus()} accessible={false}>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        autoFocus={autoFocus}
        accessibilityLabel={`Código de ${length} dígitos`}
        accessibilityValue={{ text: value.split('').join(' ') }}
        style={{ position: 'absolute', opacity: 0.01, width: '100%', height: '100%' }}
        caretHidden
      />
      <View style={{ flexDirection: 'row', gap: 8 }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {Array.from({ length }, (_, i) => {
          const current = i === Math.min(value.length, length - 1) && value.length < length;
          return (
            <View
              key={i}
              style={{
                flex: 1,
                aspectRatio: 0.82,
                maxHeight: 64,
                borderWidth,
                borderRadius: radius.sm + 2,
                borderColor: error ? colors.destructiveText : current ? colors.ring : colors.border,
                backgroundColor: colors.card,
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: current ? hardShadow('md', colors.shadow) : undefined,
              }}
            >
              <Text style={{ fontFamily: fonts.display, fontSize: 28, lineHeight: 32 }} tabular>
                {digits[i] ?? ''}
              </Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}
