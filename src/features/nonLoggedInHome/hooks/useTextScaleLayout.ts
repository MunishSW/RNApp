import { useWindowDimensions } from 'react-native';
import { layout } from '../../../theme/tokens';

/** Tiles stack to one column at text scale 1.5x or more (FR-4.2-03). At default settings the grid is exactly Figma. */
export function useTextScaleLayout() {
  const { fontScale } = useWindowDimensions();
  return { fontScale, stacked: fontScale >= layout.stackedFontScale };
}
