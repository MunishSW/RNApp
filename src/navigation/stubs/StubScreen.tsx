import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';

interface StubScreenProps {
  route: { name: string };
}

/** Placeholder for destination screens owned by other modules (spec Assumptions). */
export function StubScreen({ route }: StubScreenProps) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.pageBackground }]}>
      <Text style={{ color: theme.textOnPage }}>{route.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
