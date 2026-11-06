import type { VersionOutcome } from '../../services/versionService';

export type { VersionOutcome };
export type { TileConfig, TileId } from './nonLoggedInHomeConstants';

/** Which blocking message a Home visit is showing (data-model.md, HomeUiState). */
export interface HomeDialogState {
  contactPopupVisible: boolean;
  faqLoading: boolean;
  faqErrorVisible: boolean;
  versionOutcome: VersionOutcome;
  exitDialogVisible: boolean;
}
