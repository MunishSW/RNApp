import { useEffect } from 'react';
import { requestNonLoggedToken } from '../../../services/authService';

/**
 * Requests the non-logged token once per Home mount (BR-2). Never blocks drawing and swallows
 * every failure (NLH-E01); the app-start call is made once at the app root.
 */
export function useNonLoggedToken(): void {
  useEffect(() => {
    requestNonLoggedToken().catch(() => undefined);
  }, []);
}
