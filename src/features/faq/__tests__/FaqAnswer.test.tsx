import React from 'react';
import { Linking, StyleSheet } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { themes } from '../../../theme/tokens';
import { FaqAnswer } from '../components/FaqAnswer';

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('FaqAnswer', () => {
  it('renders bold and italic runs with the matching font styles', () => {
    render(<FaqAnswer html="Plain <b>bold</b> <i>italic</i> <u>under</u>" />);
    const bold = StyleSheet.flatten(screen.getByText('bold').props.style);
    expect(bold.fontWeight).toBe('bold');
    const italic = StyleSheet.flatten(screen.getByText('italic').props.style);
    expect(italic.fontStyle).toBe('italic');
    const under = StyleSheet.flatten(screen.getByText('under').props.style);
    expect(under.textDecorationLine).toBe('underline');
  });

  it('renders bullet and number markers for lists', () => {
    render(<FaqAnswer html="<ul><li>one</li></ul><ol><li>first</li><li>second</li></ol>" />);
    expect(screen.getByText('•')).toBeTruthy();
    expect(screen.getByText('1.')).toBeTruthy();
    expect(screen.getByText('2.')).toBeTruthy();
    expect(screen.getByText('second')).toBeTruthy();
  });

  it('opens a link once through Linking when it is pressed', () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    render(<FaqAnswer html='Go to <a href="https://example.com/help">help</a>' />);
    const link = screen.getByText('help');
    const style = StyleSheet.flatten(link.props.style);
    expect(style.color).toBe(themes.light.faqLink);
    expect(style.textDecorationLine).toBe('underline');
    expect(link.props.accessibilityRole).toBe('link');
    fireEvent.press(link);
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith('https://example.com/help');
  });

  it('does nothing and does not throw when the link cannot be opened', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no browser'));
    render(<FaqAnswer html='<a href="https://example.com">help</a>' />);
    fireEvent.press(screen.getByText('help'));
    await act(async () => undefined);
    expect(open).toHaveBeenCalledTimes(1);
    expect(screen.getByText('help')).toBeTruthy();
  });

  it('does nothing when openURL throws synchronously', () => {
    jest.spyOn(Linking, 'openURL').mockImplementation(() => {
      throw new Error('boom');
    });
    render(<FaqAnswer html='<a href="https://example.com">help</a>' />);
    expect(() => fireEvent.press(screen.getByText('help'))).not.toThrow();
  });

  // Covers: FAQ_FUNC_TC_010 - long answer renders in full without height or line limit
  it('shows a long answer in full with no height or line limit', () => {
    const long = 'word '.repeat(400).trim();
    render(<FaqAnswer html={long} />);
    const text = screen.getByText(long);
    expect(text.props.numberOfLines).toBeUndefined();
    expect(StyleSheet.flatten(text.props.style).height).toBeUndefined();
    const container = StyleSheet.flatten(screen.getByTestId('faq-answer').props.style);
    expect(container?.height).toBeUndefined();
    expect(container?.maxHeight).toBeUndefined();
  });

  it('keeps line breaks as new lines inside one text', () => {
    render(<FaqAnswer html="line1<br>line2" />);
    expect(screen.getByText('line1\nline2')).toBeTruthy();
  });

  it('renders no text for an empty answer', () => {
    render(<FaqAnswer html="" />);
    expect(screen.getByTestId('faq-answer').children).toHaveLength(0);
  });

  it('never renders script content', () => {
    render(<FaqAnswer html="safe<script>alert(1)</script>" />);
    expect(screen.getByText('safe')).toBeTruthy();
    expect(screen.queryByText(/alert/)).toBeNull();
  });
});
