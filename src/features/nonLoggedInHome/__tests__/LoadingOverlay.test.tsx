import React from 'react';
import { AccessibilityInfo, Modal } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { LoadingOverlay } from '../components/LoadingOverlay';

afterEach(() => jest.restoreAllMocks());

describe('LoadingOverlay', () => {
  // Covers: FR-4.5-03, FR-4.5-08, E-04 - visible spinner is modal, labelled and announced
  it('shows a modal, labelled spinner and announces it', () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
    render(<LoadingOverlay visible />);
    const overlay = screen.getByTestId('loading-overlay');
    expect(overlay.props.accessibilityViewIsModal).toBe(true);
    expect(overlay.props.accessibilityLabel).toBe('Loading');
    expect(overlay.props.accessibilityLiveRegion).toBe('polite');
    expect(announce).toHaveBeenCalledWith('Loading');
  });

  // Covers: FR-4.5-03 - hidden when not visible
  it('renders nothing when not visible and does not announce', () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
    announce.mockClear();
    render(<LoadingOverlay visible={false} />);
    expect(screen.queryByTestId('loading-overlay')).toBeNull();
    expect(announce).not.toHaveBeenCalled();
  });

  // Covers: FR-4.5-03 - Android back is swallowed while loading
  it('swallows the Android back request', () => {
    render(<LoadingOverlay visible />);
    const modal = screen.UNSAFE_getByType(Modal);
    expect(() => modal.props.onRequestClose()).not.toThrow();
  });
});
