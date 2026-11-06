import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { ctaGradient, layout, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/useTheme';
import { cssAngleToSvgLine } from './gradient';

interface LoginButtonProps {
  label: string;
  onPress: () => void;
  testID?: string;
}

const line = cssAngleToSvgLine(ctaGradient.angleDeg, layout.ctaWidth, layout.ctaHeight);
const HIT_SLOP = (layout.minTouchTarget - layout.ctaHeight) / 2;

/** Brand CTA: gradient and white text are exempt from dark-mode remapping. Never disabled (BR-8). */
export function LoginButton({ label, onPress, testID }: LoginButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{ top: HIT_SLOP, bottom: HIT_SLOP }}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Svg
        style={StyleSheet.absoluteFill}
        width="100%"
        height="100%"
        viewBox={`0 0 ${layout.ctaWidth} ${layout.ctaHeight}`}
        preserveAspectRatio="none">
        <Defs>
          <LinearGradient
            id="ctaGradient"
            gradientUnits="userSpaceOnUse"
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}>
            {ctaGradient.stops.map(stop => (
              <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect
          x={0}
          y={0}
          width={layout.ctaWidth}
          height={layout.ctaHeight}
          rx={layout.ctaHeight / 2}
          ry={layout.ctaHeight / 2}
          fill="url(#ctaGradient)"
        />
      </Svg>
      <View style={styles.labelWrap}>
        <Text style={[styles.label, { color: theme.ctaText }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: layout.ctaWidth,
    minHeight: layout.ctaHeight,
    borderRadius: layout.ctaRadius,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pressed: { opacity: 0.85 },
  labelWrap: {
    paddingHorizontal: 10,
    paddingVertical: 11.5,
  },
  label: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.cta.fontSize,
    textAlign: 'center',
  },
});
