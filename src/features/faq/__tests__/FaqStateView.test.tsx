import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { FaqStateView } from '../components/FaqStateView';

const ERROR =
  'Your request could not be processed at this moment. Request you to try again after sometime.';

beforeEach(() => {
  jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('FaqStateView', () => {
  it('shows a loader that is announced to screen readers', () => {
    render(<FaqStateView variant="loading" />);
    const loader = screen.getByTestId('faq-loader');
    expect(loader.props.accessibilityRole).toBe('progressbar');
    expect(loader.props.accessibilityLabel).toBe('Loading');
    expect(loader.props.accessibilityLiveRegion).toBe('polite');
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Loading');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows the empty message with no button and no announcement of an error', () => {
    render(<FaqStateView variant="empty" />);
    expect(screen.getByText('No FAQs are available right now.')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByText(ERROR)).toBeNull();
  });

  // Covers: FAQ_FUNC_TC_007, FAQ_FUNC_TC_017 - error variant shows the exact message and one Retry button inside the page (FR-024, N-02, E-06)
  it('shows the exact error message and one Retry button that calls the handler', () => {
    const onRetry = jest.fn();
    render(<FaqStateView variant="error" onRetry={onRetry} />);
    expect(screen.getByText(ERROR)).toBeTruthy();
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(screen.getByText('Retry')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('announces the error message to screen readers', () => {
    render(<FaqStateView variant="error" onRetry={jest.fn()} />);
    expect(screen.getByText(ERROR).props.accessibilityRole).toBe('alert');
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(ERROR);
  });

  it('gives the Retry button a touch height of at least 44', () => {
    render(<FaqStateView variant="error" onRetry={jest.fn()} />);
    const style = screen.getByRole('button', { name: 'Retry' }).props.style;
    const flat = Array.isArray(style) ? Object.assign({}, ...style.flat()) : style;
    expect(flat.minHeight).toBeGreaterThanOrEqual(44);
  });
});
