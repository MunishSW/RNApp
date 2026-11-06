import { store } from '../store';
import { setLoggedInToken } from '../store/tokenSlice';

/**
 * Session-expired handling for the version gate (BRD 4.7.4 "then logout").
 * The backend logout endpoint is not specified, so this only clears the in-memory logged-in token.
 */
export async function logout(): Promise<void> {
  store.dispatch(setLoggedInToken(null));
}
