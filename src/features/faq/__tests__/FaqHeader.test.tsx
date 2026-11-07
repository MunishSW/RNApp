import React from 'react';
import { StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { backArrowXml } from '../../../assets/faq';
import { faqLayout, themes, typography } from '../../../theme/tokens';
import { FaqHeader } from '../components/FaqHeader';

describe('FaqHeader', () => {
  it('shows the title FAQs as a heading in Rubik Regular 14, white', () => {
    render(<FaqHeader onBack={jest.fn()} />);
    const title = screen.getByRole('header');
    expect(title.props.children).toBe('FAQs');
    const style = StyleSheet.flatten(title.props.style);
    expect(style.fontFamily).toBe(typography.fontFamilyRegular);
    expect(style.fontSize).toBe(14);
    expect(style.color).toBe(themes.light.faqActionBarText);
    expect(StyleSheet.flatten(screen.getByTestId('faq-title-slot').props.style).left).toBe(18 + 21 + 11);
  });

  it('has a Back button that calls the handler on press', () => {
    const onBack = jest.fn();
    render(<FaqHeader onBack={onBack} />);
    fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('draws the back arrow 21 x 18 from the Figma markup', () => {
    const { UNSAFE_getByType } = render(<FaqHeader onBack={jest.fn()} />);
    const arrow = UNSAFE_getByType(SvgXml);
    expect(arrow.props.xml).toBe(backArrowXml);
    expect(arrow.props.width).toBe(21);
    expect(arrow.props.height).toBe(18);
  });

  it('gives the back button a touch area of at least 44 x 44', () => {
    render(<FaqHeader onBack={jest.fn()} />);
    const button = screen.getByRole('button', { name: 'Back' });
    const style = StyleSheet.flatten(button.props.style);
    const slop = button.props.hitSlop;
    expect((style.width as number) + slop.left + slop.right).toBeGreaterThanOrEqual(44);
    expect((style.height as number) + slop.top + slop.bottom).toBeGreaterThanOrEqual(44);
    expect(style.left).toBe(18);
  });

  it('draws a 48 high full width bar with the action bar colour and nothing else', () => {
    render(<FaqHeader onBack={jest.fn()} />);
    const bar = StyleSheet.flatten(screen.getByTestId('faq-action-bar').props.style);
    expect(bar.height).toBe(48);
    expect(bar.height).toBe(faqLayout.actionBarHeight);
    expect(bar.backgroundColor).toBe('#035795');
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
