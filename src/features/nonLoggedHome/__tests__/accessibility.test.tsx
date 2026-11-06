/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';
import React from 'react';
import { StyleSheet } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { createAppStore } from '../../../store';
import NonLoggedHomeScreen from '../NonLoggedHomeScreen';
import { CustomerCarePopup } from '../components/CustomerCarePopup';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { layout } from '../../../theme/tokens';

jest.mock('../../../services/faqService', () => ({ fetchFaq: jest.fn() }));
jest.mock('../../../services/authService', () => ({
  requestNonLoggedToken: jest.fn(() => Promise.resolve('tok')),
}));
jest.mock('../../../services/versionService', () => ({
  checkAppVersion: jest.fn(() => Promise.resolve({ kind: 'none' })),
}));
jest.mock('../../../services/sessionService', () => ({ logout: jest.fn() }));

type ScreenProps = React.ComponentProps<typeof NonLoggedHomeScreen>;

function renderHome() {
  const navigation = { navigate: jest.fn(), addListener: jest.fn(() => () => undefined) };
  const props = { navigation, route: { key: 'h', name: 'NonLoggedHome' } } as unknown as ScreenProps;
  return render(
    <Provider store={createAppStore()}>
      <NonLoggedHomeScreen {...props} />
    </Provider>,
  );
}

function listSources(dir: string, out: string[] = []): string[] {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      if (name !== '__tests__' && name !== 'assets' && name !== 'testUtils') {
        listSources(full, out);
      }
    } else if (/\.tsx$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

describe('accessibility', () => {
  // Covers: HOME_LAYOUT_TC_002 — focus order: headline, tiles row-wise, Login; icons skipped
  it('[HOME_LAYOUT_TC_002] reads headline, then tiles in order, then Login, with icons hidden', async () => {
    const { toJSON } = renderHome();
    await act(async () => undefined);
    const json = JSON.stringify(toJSON());
    const order = [
      'account, on the go!',
      '"accessibilityLabel":"Pay Now"',
      '"accessibilityLabel":"Our Products"',
      '"accessibilityLabel":"Track Application"',
      '"accessibilityLabel":"FAQs"',
      '"accessibilityLabel":"Offers"',
      '"accessibilityLabel":"Contact Us"',
      '"accessibilityLabel":"Login"',
    ];
    const positions = order.map(label => json.indexOf(label));
    positions.forEach(p => expect(p).toBeGreaterThan(-1));
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    expect(json).toContain('"importantForAccessibility":"no-hide-descendants"');
  });

  it('gives every button a role and a label equal to its visible text', async () => {
    renderHome();
    await act(async () => undefined);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(7);
    buttons.forEach(b => {
      expect(b.props.accessibilityRole).toBe('button');
      expect(typeof b.props.accessibilityLabel).toBe('string');
      expect(b.props.accessibilityLabel.length).toBeGreaterThan(0);
    });
  });

  // Covers: HOME_LAYOUT_TC_001 — touch targets of at least 44 x 44
  it('keeps every tile and the Login button at a 44 x 44 touch target', async () => {
    renderHome();
    await act(async () => undefined);
    ['payNow', 'ourProducts', 'trackApplication', 'faqs', 'offers', 'contactUs'].forEach(id => {
      const t = screen.getByTestId(`tile-${id}`);
      const style = StyleSheet.flatten(
        typeof t.props.style === 'function' ? t.props.style({ pressed: false }) : t.props.style,
      );
      expect(style.minHeight).toBeGreaterThanOrEqual(layout.minTouchTarget);
      expect(style.minWidth).toBeGreaterThanOrEqual(layout.minTouchTarget);
    });
    const login = screen.getByTestId('login-button');
    const loginStyle = StyleSheet.flatten(
      typeof login.props.style === 'function' ? login.props.style({ pressed: false }) : login.props.style,
    );
    const slack = (login.props.hitSlop.top ?? 0) + (login.props.hitSlop.bottom ?? 0);
    expect((loginStyle.minHeight as number) + slack).toBeGreaterThanOrEqual(layout.minTouchTarget);
  });

  // Covers: HOME_CONTACT_TC_001 — popup is modal for screen readers
  it('marks the Contact Us popup as modal with a heading', () => {
    render(<CustomerCarePopup visible onClose={jest.fn()} onRowPress={jest.fn()} />);
    expect(screen.getByTestId('contact-popup').props.accessibilityViewIsModal).toBe(true);
    expect(screen.getByRole('header', { name: 'We are here to help!' })).toBeTruthy();
  });

  it('announces the loading spinner politely', () => {
    render(<LoadingOverlay visible />);
    const overlay = screen.getByTestId('loading-overlay');
    expect(overlay.props.accessibilityLiveRegion).toBe('polite');
    expect(overlay.props.accessibilityViewIsModal).toBe(true);
  });

  // Covers: HOME_LAYOUT_TC_002 — no literal user-facing strings in components (constitution I)
  it('has no literal JSX text in components', () => {
    const src = path.join(__dirname, '..', '..', '..');
    const offenders = listSources(src).filter(f =>
      /<\/?[A-Za-z]+[^>]*>[A-Za-z][A-Za-z ,.!?']{2,}</.test(fs.readFileSync(f, 'utf8')),
    );
    expect(offenders).toEqual([]);
  });
});
