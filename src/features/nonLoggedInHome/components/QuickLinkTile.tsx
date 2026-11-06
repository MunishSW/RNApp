import React, { ComponentRef, forwardRef } from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { layout, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/useTheme';
import type { TileConfig } from '../nonLoggedInHomeConstants';

interface QuickLinkTileProps {
  tile: TileConfig;
  icon: ImageSourcePropType;
  onPress: (tile: TileConfig) => void;
  /** One full-width column at text scale 1.5x or more (FR-4.2-03) */
  stacked?: boolean;
  testID?: string;
}

/** One quick-link tile (Figma 2:946): 96 wide, icon 40 high above a centred white label. */
export const QuickLinkTile = forwardRef<ComponentRef<typeof Pressable>, QuickLinkTileProps>(
  function Tile({ tile, icon, onPress, stacked = false, testID }, ref) {
    const theme = useTheme();

    return (
      <Pressable
        ref={ref}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={tile.label}
        onPress={() => onPress(tile)}
        style={({ pressed }) => [
          styles.tile,
          stacked ? styles.tileStacked : styles.tileGrid,
          pressed && styles.pressed,
        ]}>
        <View
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden>
          <Image
            source={icon}
            resizeMode="contain"
            style={{ width: tile.iconWidth, height: tile.iconHeight }}
          />
        </View>
        <Text
          style={[
            styles.label,
            { color: theme.textOnPage },
            stacked ? styles.labelStacked : { width: tile.labelWidth },
          ]}>
          {tile.label}
        </Text>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  tile: {
    minHeight: layout.tileMinHeight,
    minWidth: layout.minTouchTarget,
    paddingHorizontal: layout.tilePaddingH,
    paddingVertical: layout.tilePaddingV,
    borderRadius: layout.tileRadius,
    backgroundColor: 'transparent',
    gap: layout.tileGap,
  },
  tileGrid: {
    width: layout.tileWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileStacked: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pressed: { opacity: 0.7 },
  label: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.tileLabel.fontSize,
    textAlign: 'center',
  },
  labelStacked: { flex: 1, textAlign: 'left' },
});
