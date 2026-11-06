import { useCallback, useEffect, useState } from 'react';
import { BackHandler, Linking } from 'react-native';
import { requestNonLoggedToken } from '../../../services/authService';
import { logout } from '../../../services/sessionService';
import { checkAppVersion, VersionOutcome } from '../../../services/versionService';

const NONE: VersionOutcome = { kind: 'none' };

/**
 * Background work when Home mounts. Neither call is awaited by the screen, so Home never waits
 * on them (FR-4.1-07, FR-4.7-02).
 * - Token request: once per mount, failures swallowed (FR-4.4-01, FR-4.4-06).
 * - Version check: once per fresh mount, never on focus, fails open (FR-4.7-01, FR-4.7-09).
 *   A session-expired answer shows no popup; the logged-in token is cleared silently (FR-4.7-08).
 */
export function useHomeBootstrap() {
  const [outcome, setOutcome] = useState<VersionOutcome>(NONE);

  useEffect(() => {
    let alive = true;
    requestNonLoggedToken().catch(() => undefined);
    checkAppVersion()
      .then(result => {
        if (!alive) {
          return;
        }
        if (result.kind === 'sessionExpired') {
          logout().catch(() => undefined);
          return;
        }
        if (result.kind !== 'none') {
          setOutcome(result);
        }
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const dismiss = useCallback(() => setOutcome(NONE), []);

  const onUpdate = useCallback((targetUrl: string) => {
    Linking.openURL(targetUrl).catch(() => undefined);
  }, []);

  const onExit = useCallback(() => {
    BackHandler.exitApp();
  }, []);

  const blocking = outcome.kind === 'maintenance' || outcome.kind === 'mandatory';

  return { outcome, blocking, onUpdate, onExit, onSkip: dismiss, onOkay: dismiss };
}
