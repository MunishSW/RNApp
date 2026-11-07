import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { chevronDownXml } from '../../../assets/faq';
import { themes } from '../../../theme/tokens';
import { FaqCard } from '../components/FaqCard';

const LONG_QUESTION =
  'What happens to my home loan interest rate if the benchmark rate changes while I am repaying and I also prepay part of the principal in the same month?';

function Harness({ question, answer }: { question: string; answer: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <FaqCard
      question={question}
      answer={answer}
      expanded={expanded}
      onToggle={() => setExpanded(value => !value)}
    />
  );
}

const rotation = () => {
  const style = StyleSheet.flatten(screen.getByTestId('faq-chevron', { includeHiddenElements: true }).props.style);
  return style.transform[0].rotate;
};

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('FaqCard', () => {
  it('shows the full question with no line limit', () => {
    render(<Harness question={LONG_QUESTION} answer="x" />);
    const text = screen.getByText(LONG_QUESTION);
    expect(text.props.numberOfLines).toBeUndefined();
    expect(text.props.ellipsizeMode).toBeUndefined();
    const style = StyleSheet.flatten(text.props.style);
    expect(style.fontSize).toBe(12);
    expect(style.lineHeight).toBe(18);
    expect(style.fontFamily).toBe('Rubik-Regular');
    expect(style.color).toBe(themes.light.faqText);
    expect(style.height).toBeUndefined();
  });

  it('is a white card with radius 4, padding 12 and a minimum height of 44', () => {
    render(<Harness question="Q" answer="A" />);
    const style = StyleSheet.flatten(screen.getByRole('button').props.style);
    expect(style.backgroundColor).toBe(themes.light.faqCardBackground);
    expect(style.borderRadius).toBe(4);
    expect(style.padding).toBe(12);
    expect(style.minHeight).toBe(44);
  });

  it('is a button labelled with the question and reports expanded false then true', () => {
    render(<Harness question="What is EMI?" answer="Monthly instalment" />);
    const card = screen.getByRole('button', { name: 'What is EMI?' });
    expect(card.props.accessibilityLabel).toBe('What is EMI?');
    expect(card.props.accessibilityState).toEqual({ expanded: false });
    expect(card.props.accessibilityValue).toEqual({ text: 'Collapsed' });
    fireEvent.press(card);
    const open = screen.getByRole('button', { name: 'What is EMI?' });
    expect(open.props.accessibilityState).toEqual({ expanded: true });
    expect(open.props.accessibilityValue).toEqual({ text: 'Expanded' });
  });

  it('shows the answer area only while open', () => {
    render(<Harness question="Q" answer="Monthly instalment" />);
    expect(screen.queryByTestId('faq-answer')).toBeNull();
    expect(screen.queryByText('Monthly instalment')).toBeNull();
    fireEvent.press(screen.getByRole('button'));
    expect(screen.getByTestId('faq-answer')).toBeTruthy();
    expect(screen.getByText('Monthly instalment')).toBeTruthy();
    fireEvent.press(screen.getByRole('button'));
    expect(screen.queryByTestId('faq-answer')).toBeNull();
  });

  it('draws the 20 x 20 chevron from the Figma markup, hidden from screen readers', () => {
    const { UNSAFE_getByType } = render(<Harness question="Q" answer="A" />);
    const chevron = UNSAFE_getByType(SvgXml);
    expect(chevron.props.xml).toBe(chevronDownXml);
    expect(chevron.props.width).toBe(20);
    expect(chevron.props.height).toBe(20);
    const wrapper = screen.getByTestId('faq-chevron', { includeHiddenElements: true });
    expect(wrapper.props.accessibilityElementsHidden).toBe(true);
    expect(wrapper.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('turns the chevron upside down when open and back when closed, with one short animation', () => {
    render(<Harness question="Q" answer="A" />);
    expect(rotation()).toBe('0deg');
    fireEvent.press(screen.getByRole('button'));
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(rotation()).toBe('180deg');
    fireEvent.press(screen.getByRole('button'));
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(rotation()).toBe('0deg');
  });

  it('opens to an empty area for an empty answer without an error', () => {
    render(<Harness question="Q" answer="" />);
    fireEvent.press(screen.getByRole('button'));
    const area = screen.getByTestId('faq-answer');
    expect(area.children).toHaveLength(0);
  });
});
