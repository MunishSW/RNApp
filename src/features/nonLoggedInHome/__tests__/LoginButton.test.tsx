import React from 'react';
import { processColor, StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ctaGradient, layout, typography } from '../../../theme/tokens';
import { LoginButton } from '../components/LoginButton';
import { cssAngleToSvgLine } from '../components/gradient';
import { LOGIN_LABEL } from '../nonLoggedInHomeConstants';

function flat(button: { props: Record<string, unknown> }) {
  return StyleSheet.flatten(button.props.style as never);
}

describe('LoginButton', () => {
  // label "Login", role button, 307 x 40, radius 82 (FR-020, BR-8)
  it('renders a "Login" button with the Figma size and radius', () => {
    render(<LoginButton label={LOGIN_LABEL} onPress={jest.fn()} />);
    const button = screen.getByRole('button', { name: 'Login' });
    const style = flat(button);
    expect(style.width).toBe(layout.ctaWidth);
    expect(style.minHeight).toBe(layout.ctaHeight);
    expect(style.borderRadius).toBe(82);
    const label = StyleSheet.flatten(screen.getByText('Login').props.style);
    expect(label.fontFamily).toBe(typography.fontFamilyMedium);
    expect(label.fontSize).toBe(14);
    expect(button.props.accessibilityLabel).toBe('Login');
  });

  // gradient stops and angle come from the tokens (FR-020)
  it('draws the gradient from the token stops and angle', () => {
    const { toJSON } = render(<LoginButton label={LOGIN_LABEL} onPress={jest.fn()} />);
    const json = JSON.stringify(toJSON());
    const [first, second] = ctaGradient.stops;
    // The SVG layer stores colours as signed 32-bit integers.
    const signed = (color: string) => {
      const value = processColor(color) as number;
      return value > 0x7fffffff ? value - 0x100000000 : value;
    };
    expect(json).toContain(
      JSON.stringify([first.offset, signed(first.color), second.offset, signed(second.color)]),
    );
    const line = cssAngleToSvgLine(ctaGradient.angleDeg, layout.ctaWidth, layout.ctaHeight);
    expect(line.x2).toBeGreaterThan(line.x1);
    expect(line.y2).toBeGreaterThan(line.y1);
  });

  // never disabled, press calls the handler (FR-022, BR-8, P-02)
  it('is never disabled and calls the handler on press', () => {
    const onPress = jest.fn();
    render(<LoginButton label={LOGIN_LABEL} onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Login' });
    expect(button.props.accessibilityState?.disabled).toBeFalsy();
    fireEvent.press(button);
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  // touch height reaches 44 with the extra hit area (FR-023)
  it('reaches a 44 high touch target through its hit area', () => {
    render(<LoginButton label={LOGIN_LABEL} onPress={jest.fn()} />);
    const button = screen.getByRole('button', { name: 'Login' });
    const slop = button.props.hitSlop as { top: number; bottom: number };
    expect(layout.ctaHeight + slop.top + slop.bottom).toBeGreaterThanOrEqual(44);
  });
});
