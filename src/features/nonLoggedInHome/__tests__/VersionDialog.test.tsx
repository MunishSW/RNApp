import React from 'react';
import { Modal } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { restorePlatformOS, setPlatformOS } from '../../../testUtils/platform';
import { VersionDialog } from '../components/VersionDialog';

const handlers = () => ({ onUpdate: jest.fn(), onExit: jest.fn(), onSkip: jest.fn(), onOkay: jest.fn() });

afterEach(() => restorePlatformOS());

describe('VersionDialog', () => {
  // Covers: FR-4.7-05, N-06, TC-407, TC-803 - maintenance: server message, "Exit" only, not dismissable (Android)
  it('[TC-407] shows the maintenance message with only "Exit" on Android and cannot be dismissed', () => {
    setPlatformOS('android');
    const h = handlers();
    render(<VersionDialog outcome={{ kind: 'maintenance', message: 'Down for maintenance' }} {...h} />);
    expect(screen.getByText('Down for maintenance')).toBeTruthy();
    expect(screen.getAllByRole('button').map(b => b.props.accessibilityLabel)).toEqual(['Exit']);
    fireEvent(screen.UNSAFE_getByType(Modal), 'requestClose');
    expect(h.onSkip).not.toHaveBeenCalled();
    expect(h.onOkay).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole('button', { name: 'Exit' }));
    expect(h.onExit).toHaveBeenCalledTimes(1);
  });

  // Covers: FR-4.7-05, E-12 - maintenance on iOS has no button at all
  it('shows the maintenance message with no button on iOS', () => {
    setPlatformOS('ios');
    render(<VersionDialog outcome={{ kind: 'maintenance', message: 'Down' }} {...handlers()} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  // Covers: FR-4.7-06, N-07, TC-408, TC-804 - mandatory: exact text, "Update" opens target, "Exit" on Android, not dismissable
  it('[TC-408] shows the mandatory message with "Update" and "Exit" on Android', () => {
    setPlatformOS('android');
    const h = handlers();
    render(<VersionDialog outcome={{ kind: 'mandatory', targetUrl: 'https://store.example.test/a' }} {...h} />);
    expect(screen.getByText('Update your app to experience all the latest features.')).toBeTruthy();
    expect(screen.getAllByRole('button').map(b => b.props.accessibilityLabel)).toEqual(['Update', 'Exit']);
    fireEvent.press(screen.getByRole('button', { name: 'Update' }));
    expect(h.onUpdate).toHaveBeenCalledWith('https://store.example.test/a');
    fireEvent(screen.UNSAFE_getByType(Modal), 'requestClose');
    expect(h.onSkip).not.toHaveBeenCalled();
    expect(h.onExit).not.toHaveBeenCalled();
  });

  // Covers: FR-4.7-06, E-12, TC-802 - iOS mandatory has "Update" only and cannot be dismissed
  it('[TC-802] shows only "Update" on iOS and cannot be dismissed', () => {
    setPlatformOS('ios');
    const h = handlers();
    render(<VersionDialog outcome={{ kind: 'mandatory', targetUrl: 'u' }} {...h} />);
    expect(screen.getAllByRole('button').map(b => b.props.accessibilityLabel)).toEqual(['Update']);
    fireEvent(screen.UNSAFE_getByType(Modal), 'requestClose');
    expect(h.onSkip).not.toHaveBeenCalled();
  });

  // Covers: FR-4.7-07, N-07, TC-409 - optional: "Update" and "Skip"; "Skip" and back close it
  it('[TC-409] shows "Update" and "Skip" for an optional update and Skip closes it', () => {
    setPlatformOS('android');
    const h = handlers();
    render(<VersionDialog outcome={{ kind: 'optional', targetUrl: 'u' }} {...h} />);
    expect(screen.getByText('Update your app to experience all the latest features.')).toBeTruthy();
    expect(screen.getAllByRole('button').map(b => b.props.accessibilityLabel)).toEqual(['Update', 'Skip']);
    fireEvent.press(screen.getByRole('button', { name: 'Skip' }));
    expect(h.onSkip).toHaveBeenCalledTimes(1);
    fireEvent(screen.UNSAFE_getByType(Modal), 'requestClose');
    expect(h.onSkip).toHaveBeenCalledTimes(2);
  });

  // Covers: FR-4.7-08 - a generic error shows the message with "Okay"
  it('shows an error message with "Okay"', () => {
    const h = handlers();
    render(<VersionDialog outcome={{ kind: 'error', message: 'Server said no' }} {...h} />);
    expect(screen.getByText('Server said no')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Okay' }));
    expect(h.onOkay).toHaveBeenCalledTimes(1);
  });

  // Covers: FR-4.7-08, N-08, FR-4.7-09, N-09 - none and sessionExpired show nothing
  it('renders nothing for none and for sessionExpired', () => {
    const { rerender } = render(<VersionDialog outcome={{ kind: 'none' }} {...handlers()} />);
    expect(screen.queryByTestId('version-dialog')).toBeNull();
    rerender(<VersionDialog outcome={{ kind: 'sessionExpired', message: 'expired' }} {...handlers()} />);
    expect(screen.queryByText('expired')).toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
