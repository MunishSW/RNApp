import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { nonLoggedInHomeAssets } from '../../../assets/nonLoggedInHome';
import { QuickLinkTile } from '../components/QuickLinkTile';
import { TILES } from '../nonLoggedInHomeConstants';

function flat(button: { props: Record<string, unknown> }) {
  return StyleSheet.flatten(button.props.style as never);
}

describe('QuickLinkTile', () => {
  // role button, label, Figma sizes and touch target (FR-011, BR-4)
  it('renders a button with the tile label, width 96, padding 12 and 16, and a 44 minimum', () => {
    render(<QuickLinkTile tile={TILES[0]} icon={nonLoggedInHomeAssets.payNow} onPress={jest.fn()} />);
    const button = screen.getByRole('button', { name: 'Pay Now' });
    const style = flat(button);
    expect(style.width).toBe(96);
    expect(style.paddingHorizontal).toBe(12);
    expect(style.paddingVertical).toBe(16);
    expect(style.borderRadius).toBe(4);
    expect(style.backgroundColor).toBe('transparent');
    expect(style.minHeight).toBeGreaterThanOrEqual(44);
    expect(style.minWidth).toBeGreaterThanOrEqual(44);
  });

  // accessibility label equals the visible text, icon hidden (FR-011, FR-066)
  it('hides the decorative icon and keeps the label as the meaning', () => {
    const { toJSON } = render(
      <QuickLinkTile tile={TILES[0]} icon={nonLoggedInHomeAssets.payNow} onPress={jest.fn()} />,
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('"importantForAccessibility":"no-hide-descendants"');
    expect(json).toContain('"accessibilityElementsHidden":true');
    expect(screen.getByRole('button', { name: 'Pay Now' }).props.accessibilityLabel).toBe('Pay Now');
    expect(screen.getByText('Pay Now')).toBeTruthy();
  });

  // pressing reports the tile and gives feedback without a layout shift (FR-011)
  it('calls onPress with its tile and changes only opacity while pressed', () => {
    const onPress = jest.fn();
    render(<QuickLinkTile tile={TILES[1]} icon={nonLoggedInHomeAssets.ourProducts} onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Our Products' });
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledWith(TILES[1]);
    const styleFn = screen
      .UNSAFE_getAllByProps({ accessibilityLabel: 'Our Products' })
      .map(node => node.props.style)
      .find(style => typeof style === 'function') as (s: { pressed: boolean }) => never;
    const idle = StyleSheet.flatten(styleFn({ pressed: false }));
    const pressed = StyleSheet.flatten(styleFn({ pressed: true }));
    expect(idle.opacity).toBeUndefined();
    expect(pressed.opacity).toBeLessThan(1);
    expect({ ...pressed, opacity: undefined }).toEqual({ ...idle, opacity: undefined });
  });

  // Track Application uses the 63 wide label box so it wraps to two lines (FR-013, E-07)
  it('uses the Figma label box widths and icon sizes', () => {
    const track = TILES[2];
    render(<QuickLinkTile tile={track} icon={nonLoggedInHomeAssets.trackApplication} onPress={jest.fn()} />);
    const label = StyleSheet.flatten(screen.getByText('Track Application').props.style);
    expect(label.width).toBe(63);
    expect(label.fontSize).toBe(11.889);
    expect(track.iconHeight).toBe(40.234);
    expect(TILES.map(t => t.labelWidth)).toEqual([63, 74, 63, 82, 63, 63]);
  });

  // stacked tiles are a full-width row with a left-aligned label (FR-012, E-01)
  it('becomes a full-width row with a flexible label when stacked', () => {
    render(<QuickLinkTile tile={TILES[3]} icon={nonLoggedInHomeAssets.faqs} onPress={jest.fn()} stacked />);
    const style = flat(screen.getByRole('button', { name: 'FAQs' }));
    expect(style.width).toBe('100%');
    expect(style.flexDirection).toBe('row');
    const label = StyleSheet.flatten(screen.getByText('FAQs').props.style);
    expect(label.textAlign).toBe('left');
    expect(label.width).toBeUndefined();
  });
});
