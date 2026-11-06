import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { nonLoggedInHomeAssets } from '../../../assets/nonLoggedInHome';
import { layout } from '../../../theme/tokens';
import { QuickLinkGrid } from '../components/QuickLinkGrid';
import { TILES } from '../nonLoggedInHomeConstants';

const icons = {
  payNow: nonLoggedInHomeAssets.payNow,
  ourProducts: nonLoggedInHomeAssets.ourProducts,
  trackApplication: nonLoggedInHomeAssets.trackApplication,
  faqs: nonLoggedInHomeAssets.faqs,
  offers: nonLoggedInHomeAssets.offers,
  contactUs: nonLoggedInHomeAssets.contactUs,
};

describe('QuickLinkGrid', () => {
  // Covers: HOME_LAYOUT_TC_001, HOME_LAYOUT_TC_002 - six tiles in a 3 + 3 layout in the fixed order (FR-010, BR-4, P-01)
  it('shows six tiles in two rows of three in the fixed order', () => {
    render(<QuickLinkGrid tiles={TILES} icons={icons} onTilePress={jest.fn()} stacked={false} />);
    const row1 = within(screen.getByTestId('home-grid-row-1'));
    const row2 = within(screen.getByTestId('home-grid-row-2'));
    expect(row1.getAllByRole('button').map(b => b.props.accessibilityLabel)).toEqual([
      'Pay Now',
      'Our Products',
      'Track Application',
    ]);
    expect(row2.getAllByRole('button').map(b => b.props.accessibilityLabel)).toEqual([
      'FAQs',
      'Offers',
      'Contact Us',
    ]);
  });

  // Figma grid width 331 and 18 gap, rows spread tiles with space between (FR-010)
  it('uses the Figma grid width, row gap and spacing', () => {
    render(<QuickLinkGrid tiles={TILES} icons={icons} onTilePress={jest.fn()} stacked={false} />);
    const grid = StyleSheet.flatten(screen.getByTestId('home-grid').props.style);
    expect(grid.width).toBe(layout.gridWidth);
    expect(grid.gap).toBe(18);
    expect(grid.marginTop).toBe(18);
    const row = StyleSheet.flatten(screen.getByTestId('home-grid-row-1').props.style);
    expect(row.flexDirection).toBe('row');
    expect(row.justifyContent).toBe('space-between');
  });

  // one full-width column when stacked (FR-012, E-01)
  it('stacks into one full-width column at large text', () => {
    render(<QuickLinkGrid tiles={TILES} icons={icons} onTilePress={jest.fn()} stacked />);
    expect(screen.queryByTestId('home-grid-row-1')).toBeNull();
    expect(screen.getAllByRole('button')).toHaveLength(6);
    const grid = StyleSheet.flatten(screen.getByTestId('home-grid').props.style);
    expect(grid.width).toBe('100%');
  });

  // a tile press reports the tile (FR-018)
  it('reports the pressed tile', () => {
    const onTilePress = jest.fn();
    render(<QuickLinkGrid tiles={TILES} icons={icons} onTilePress={onTilePress} stacked={false} />);
    fireEvent.press(screen.getByRole('button', { name: 'Offers' }));
    expect(onTilePress).toHaveBeenCalledWith(TILES[4]);
  });
});
