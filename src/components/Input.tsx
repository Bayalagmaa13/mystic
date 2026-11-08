import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '@/lib/theme';
import { Txt } from './Txt';

interface Props extends TextInputProps {
  label?: string;
  error?: string | null;
  icon?: keyof typeof Ionicons.glyphMap;
  right?: React.ReactNode;
  password?: boolean;
}

/** Шошго, алдааны мессеж, нууц үг харах товчтой оролтын талбар */
export function Input({ label, error, icon, right, password, style, multiline, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  return (
    <View style={{ gap: 6, alignSelf: 'stretch' }}>
      {label ? <Txt variant="label">{label}</Txt> : null}
      <View
        style={[
          styles.box,
          multiline && { height: undefined, minHeight: 88, alignItems: 'flex-start', paddingVertical: 12 },
          { borderColor: error ? colors.danger : focused ? colors.lavender : colors.border },
        ]}
      >
        {icon ? <Ionicons name={icon} size={18} color={colors.muted} /> : null}
        <TextInput
          placeholderTextColor={colors.dim}
          selectionColor={colors.lavender}
          secureTextEntry={password && hidden}
          multiline={multiline}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          style={[styles.input, multiline && { textAlignVertical: 'top' }, style]}
          {...rest}
        />
        {password ? (
          <Pressable hitSlop={10} onPress={() => setHidden((h) => !h)}>
            <Txt variant="gold" style={{ fontSize: 12 }}>{hidden ? 'Харах' : 'Нуух'}</Txt>
          </Pressable>
        ) : null}
        {right}
      </View>
      {error ? <Txt style={{ color: colors.danger, fontSize: 12 }}>{error}</Txt> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 52, borderRadius: radius.md, borderWidth: 1, backgroundColor: colors.surface,
    paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  input: { flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 15, paddingVertical: 0 },
});
