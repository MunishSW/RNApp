import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import PayNowScreen from '../PayNowScreen';

type ScreenProps = React.ComponentProps<typeof PayNowScreen>;

function setup(params: { title: string } | undefined = { title: 'Pay Now' }) {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };
  const props = {
    navigation,
    route: { key: 'pay', name: 'NonLoggedInPayNow', params },
  } as unknown as ScreenProps;
  render(<PayNowScreen {...props} />);
  return navigation;
}

describe('PayNowScreen', () => {
  // Covers: FR-4.2-05, BR-5, P-03, TC-202 - header "Pay Now" and a back button
  it('[TC-202] shows the header "Pay Now" and a back button', () => {
    setup();
    expect(screen.getByRole('header').props.children).toBe('Pay Now');
    expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy();
  });

  // Covers: FR-4.2-05 - nothing else is on the screen (no web view, loader, error state)
  it('has only the back button and the title', () => {
    setup();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.queryByTestId('loading-overlay')).toBeNull();
    expect(screen.queryByText(/error|retry|loading/i)).toBeNull();
  });

  // Covers: FR-4.2-05, N-11 - back returns to Home (explicit target)
  it('[N-11] returns to Home when back is pressed', () => {
    const navigation = setup();
    fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(navigation.navigate).toHaveBeenCalledWith('NonLoggedInHome');
  });

  // Covers: FR-7.4-04 - back target is at least 44 x 44
  it('gives the back button a 44 x 44 touch target', () => {
    setup();
    const back = StyleSheet.flatten(screen.getByTestId('pay-now-back').props.style);
    expect(back.minWidth).toBeGreaterThanOrEqual(44);
    expect(back.minHeight).toBeGreaterThanOrEqual(44);
  });

  // Covers: FR-4.2-05 - falls back to the label file title when no params are given
  it('uses the label-file title when the route has no params', () => {
    setup(undefined);
    expect(screen.getByRole('header').props.children).toBe('Pay Now');
  });
});
