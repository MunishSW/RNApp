import { Dimensions } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import { useTextScaleLayout } from '../hooks/useTextScaleLayout';

const original = Dimensions.get('window');

function withFontScale(fontScale: number) {
  const window = { width: 360, height: 812, scale: 3, fontScale };
  act(() => {
    Dimensions.set({ window, screen: window });
  });
}

afterEach(() => {
  act(() => {
    Dimensions.set({ window: original, screen: original });
  });
});

describe('useTextScaleLayout', () => {
  // Covers: FR-4.2-03, BR-4, E-01, TC-603 - stack from font scale 1.5
  it.each([
    [1, false],
    [1.49, false],
    [1.5, true],
    [2, true],
  ])('font scale %s gives stacked=%s', (scale, stacked) => {
    withFontScale(scale);
    const { result } = renderHook(() => useTextScaleLayout());
    expect(result.current.stacked).toBe(stacked);
    expect(result.current.fontScale).toBe(scale);
  });
});
