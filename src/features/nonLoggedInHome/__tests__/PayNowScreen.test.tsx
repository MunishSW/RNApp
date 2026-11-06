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
  // header "Pay Now" and a back button (FR-014, BR-5, P-03)
  it('shows the header "Pay Now" and a back button', () => {
    setup();
    expect(screen.getByRole('header').props.children).toBe('Pay Now');
    expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy();
  });

  // nothing else is on the screen (no web view, loader, error state) (FR-014)
  it('has only the back button and the title', () => {
    setup();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.queryByTestId('loading-overlay')).toBeNull();
    expect(screen.queryByText(/error|retry|loading/i)).toBeNull();
  });

  // back returns to Home (explicit target) (FR-014, N-11)
  it('returns to Home when back is pressed', () => {
    const navigation = setup();
    fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(navigation.navigate).toHaveBeenCalledWith('NonLoggedInHome');
  });

  // back target is at least 44 x 44 (FR-069)
  it('gives the back button a 44 x 44 touch target', () => {
    setup();
    const back = StyleSheet.flatten(screen.getByTestId('pay-now-back').props.style);
    expect(back.minWidth).toBeGreaterThanOrEqual(44);
    expect(back.minHeight).toBeGreaterThanOrEqual(44);
  });

  // falls back to the label file title when no params are given (FR-014)
  it('uses the label-file title when the route has no params', () => {
    setup(undefined);
    expect(screen.getByRole('header').props.children).toBe('Pay Now');
  });
});
