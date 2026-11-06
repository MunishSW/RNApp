import React, { ComponentRef, Ref } from 'react';
import { ImageSourcePropType, Pressable, StyleSheet, View } from 'react-native';
import { layout } from '../../../theme/tokens';
import type { TileConfig, TileId } from '../nonLoggedInHomeConstants';
import { QuickLinkTile } from './QuickLinkTile';

interface QuickLinkGridProps {
  tiles: readonly TileConfig[];
  icons: Record<TileId, ImageSourcePropType>;
  onTilePress: (tile: TileConfig) => void;
  stacked: boolean;
  /** Ref of the Contact Us tile, so focus can return to it when its popup closes (FR-4.6-04) */
  contactTileRef?: Ref<ComponentRef<typeof Pressable>>;
}

/** Quick-link grid (Figma 2:944): 331 wide, two rows of three with 18 gap; one column when stacked (FR-4.2-03). */
export function QuickLinkGrid({ tiles, icons, onTilePress, stacked, contactTileRef }: QuickLinkGridProps) {
  const renderTile = (tile: TileConfig) => (
    <QuickLinkTile
      key={tile.id}
      ref={tile.id === 'contactUs' ? contactTileRef : undefined}
      testID={`tile-${tile.id}`}
      tile={tile}
      icon={icons[tile.id]}
      onPress={onTilePress}
      stacked={stacked}
    />
  );

  return (
    <View testID="home-grid" style={[styles.grid, stacked && styles.gridStacked]}>
      {stacked ? (
        tiles.map(renderTile)
      ) : (
        <>
          <View testID="home-grid-row-1" style={styles.row}>
            {tiles.slice(0, 3).map(renderTile)}
          </View>
          <View testID="home-grid-row-2" style={styles.row}>
            {tiles.slice(3).map(renderTile)}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: layout.gridWidth,
    maxWidth: '100%',
    marginTop: layout.blockGap,
    gap: layout.gridRowGap,
  },
  gridStacked: { width: '100%', paddingHorizontal: layout.tilePaddingH },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
});
