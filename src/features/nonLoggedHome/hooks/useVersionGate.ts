import { useCallback, useEffect, useState } from 'react';
import { BackHandler, Linking } from 'react-native';
import { logout } from '../../../services/sessionService';
import { checkAppVersion, VersionOutcome } from '../../../services/versionService';

/**
 * Force-update / maintenance gate (FR-016, FR-017): runs once per fresh Home mount, never blocks
 * rendering or navigation, and fails open.
 */
export function useVersionGate() {
  const [outcome, setOutcome] = useState<VersionOutcome>({ kind: 'none' });

  useEffect(() => {
    let alive = true;
    checkAppVersion()
      .then(result => {
        if (alive) {
          setOutcome(result);
        }
      })
      .catch(() => undefined); // fail open: never lock the user out (BR-9)
    return () => {
      alive = false;
    };
  }, []);

  const dismiss = useCallback(() => setOutcome({ kind: 'none' }), []);

  const onUpdate = useCallback((targetUrl: string) => {
    Linking.openURL(targetUrl).catch(() => undefined);
  }, []);

  const onExit = useCallback(() => {
    BackHandler.exitApp();
  }, []);

  const onOkay = useCallback(() => {
    const expired = outcome.kind === 'sessionExpired';
    dismiss();
    if (expired) {
      logout().catch(() => undefined);
    }
  }, [dismiss, outcome.kind]);

  const blocking = outcome.kind === 'maintenance' || outcome.kind === 'mandatory';

  return { outcome, blocking, onUpdate, onExit, onSkip: dismiss, onOkay };
}
