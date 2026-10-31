import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, POP_OFFSET, space, type } from '@/theme/tokens';
import { useFont, useIsLatin } from '@/theme/useFont';

import { useReduceMotion } from './useReduceMotion';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export function PopButton({ label, onPress, variant = 'primary', disabled = false }: Props) {
  const font = useFont('bold');
  const latin = useIsLatin();
  const reduceMotion = useReduceMotion();
  const offset = useRef(new Animated.Value(0)).current;
  const primary = variant === 'primary';

  const faceStyle = { transform: [{ translateX: offset }, { translateY: offset }] };

  const setPressed = (v: number) => {
    const to = v * POP_OFFSET;
    if (reduceMotion) offset.setValue(to);
    else Animated.timing(offset, { toValue: to, duration: 70, useNativeDriver: true }).start();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPressIn={() => {
        setPressed(1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }}
      onPressOut={() => setPressed(0)}
      onPress={onPress}
      style={[styles.wrap, disabled && styles.disabled]}>
      <View style={[styles.edge, { backgroundColor: primary ? colors.accentEdge : colors.hairline }]} />
      <Animated.View style={[styles.face, primary ? styles.primary : styles.secondary, faceStyle]}>
        <Text
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          style={[styles.label, { fontFamily: font, letterSpacing: latin ? 0.5 : 0, color: primary ? colors.onAccent : colors.text }]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingRight: POP_OFFSET, paddingBottom: POP_OFFSET },
  edge: { position: 'absolute', left: POP_OFFSET, top: POP_OFFSET, right: 0, bottom: 0 },
  face: { minHeight: 48, paddingHorizontal: space.lg, paddingVertical: space.md, justifyContent: 'center' },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairline },
  label: { ...type.body, textAlign: 'center' },
  disabled: { opacity: 0.4 },
});
