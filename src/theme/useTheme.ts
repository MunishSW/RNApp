import { useColorScheme } from 'react-native';
import { themes, ThemeTokens } from './tokens';

export function useTheme(): ThemeTokens {
  const scheme = useColorScheme();
  return scheme === 'dark' ? themes.dark : themes.light;
}
