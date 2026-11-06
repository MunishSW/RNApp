import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { nonLoggedHomeAssets } from '../../../assets/nonLoggedHome';
import { LoginButton } from '../components/LoginButton';
import { QuickLinkTile } from '../components/QuickLinkTile';
import { cssAngleToSvgLine } from '../components/gradient';
import { LOGIN_LABEL, QUICK_LINKS } from '../nonLoggedHomeConstants';

describe('QuickLinkTile', () => {
  const trackApplication = QUICK_LINKS[2];

  // Covers: HOME_LAYOUT_TC_001 — tile renders icon above label per Figma, role button with label
  it('[HOME_LAYOUT_TC_001] renders a button with the label and a Figma-sized icon', () => {
    render(
      <QuickLinkTile
        config={QUICK_LINKS[0]}
        icon={nonLoggedHomeAssets.payNow}
        onPress={jest.fn()}
      />,
    );
    const button = screen.getByRole('button', { name: 'Pay Now' });
    const style = StyleSheet.flatten(
      typeof button.props.style === 'function' ? button.props.style({ pressed: false }) : button.props.style,
    );
    expect(style.width).toBe(96);
    expect(style.paddingHorizontal).toBe(12);
    expect(style.paddingVertical).toBe(16);
    expect(style.minHeight).toBeGreaterThanOrEqual(44);
  });

  it('hides the decorative icon from screen readers and keeps the label as the meaning', () => {
    const { toJSON } = render(
      <QuickLinkTile config={QUICK_LINKS[0]} icon={nonLoggedHomeAssets.payNow} onPress={jest.fn()} />,
    );
    expect(JSON.stringify(toJSON())).toContain('"importantForAccessibility":"no-hide-descendants"');
    expect(JSON.stringify(toJSON())).toContain('"accessibilityElementsHidden":true');
  });

  // Covers: HOME_ACTION_TC_002 — whole tile is pressable and reports its config
  it('[HOME_ACTION_TC_002] calls onPress with its config', () => {
    const onPress = jest.fn();
    render(
      <QuickLinkTile
        config={QUICK_LINKS[1]}
        icon={nonLoggedHomeAssets.ourProducts}
        onPress={onPress}
      />,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Our Products' }));
    expect(onPress).toHaveBeenCalledWith(QUICK_LINKS[1]);
  });

  // Covers: HOME_LAYOUT_TC_001 — Track Application label wraps in the Figma label width
  it('gives Track Application the 63 wide label so it wraps to two lines', () => {
    const { toJSON } = render(
      <QuickLinkTile
        config={trackApplication}
        icon={nonLoggedHomeAssets.trackApplication}
        onPress={jest.fn()}
      />,
    );
    expect(JSON.stringify(toJSON())).toContain('"width":63');
  });

  // Covers: HOME_NET_TC_011 — same tile in stacked mode keeps the label and role
  it('stacked mode uses a full-width row layout', () => {
    const { toJSON } = render(
      <QuickLinkTile
        config={QUICK_LINKS[0]}
        icon={nonLoggedHomeAssets.payNow}
        onPress={jest.fn()}
        stacked
      />,
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('"flexDirection":"row"');
    expect(json).toContain('"width":"100%"');
  });
});

describe('LoginButton', () => {
  // Covers: HOME_LAYOUT_TC_001 — Login pill with accessibility label equal to text
  it('[HOME_LAYOUT_TC_001] renders a Login button with label, 307 x 40 pill and 44 high touch area', () => {
    const { toJSON } = render(<LoginButton label={LOGIN_LABEL} onPress={jest.fn()} />);
    const button = screen.getByRole('button', { name: 'Login' });
    expect(button.props.hitSlop).toEqual({ top: 2, bottom: 2 });
    const json = JSON.stringify(toJSON());
    expect(json).toContain('"width":307');
    expect(json).toContain('"borderRadius":82');
    expect(json).toContain('"minHeight":40');
  });

  // Covers: HOME_ACTION_TC_007 — Login press
  it('[HOME_ACTION_TC_007] calls onPress and is never disabled', () => {
    const onPress = jest.fn();
    render(<LoginButton label={LOGIN_LABEL} onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Login' });
    expect(button.props.accessibilityState?.disabled).toBeFalsy();
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('cssAngleToSvgLine', () => {
  it('maps the Figma 133.8 degree gradient to a down-right line across the CTA box', () => {
    const line = cssAngleToSvgLine(133.8255, 307, 40);
    expect(line.x2).toBeGreaterThan(line.x1);
    expect(line.y2).toBeGreaterThan(line.y1);
    expect((line.x1 + line.x2) / 2).toBeCloseTo(153.5, 3);
    expect((line.y1 + line.y2) / 2).toBeCloseTo(20, 3);
  });

  it('maps 90 degrees to a left-to-right line', () => {
    const line = cssAngleToSvgLine(90, 100, 40);
    expect(line.x1).toBeCloseTo(0, 5);
    expect(line.x2).toBeCloseTo(100, 5);
    expect(line.y1).toBeCloseTo(20, 5);
  });
});
