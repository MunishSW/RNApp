import { SERVER_ERROR_MESSAGE } from '../features/nonLoggedHome/nonLoggedHomeConstants';
import { getAppVersion, getUserAgentName } from './deviceInfo';
import { post } from './httpClient';

export type VersionOutcome =
  | { kind: 'none' }
  | { kind: 'maintenance'; message: string }
  | { kind: 'mandatory'; targetUrl: string }
  | { kind: 'optional'; targetUrl: string }
  | { kind: 'sessionExpired'; message: string }
  | { kind: 'error'; message: string };

interface VersionResponse {
  returnStatus?: { returnCode?: string; returnMessage?: string };
  maintenance_flag?: string;
  maintenance_msg?: string;
  version?: string;
  force_update_flag?: string;
  optional_update?: string;
  status?: string;
  target_url?: string;
}

const NONE: VersionOutcome = { kind: 'none' };
const SUCCESS = 'success';

/** Compares dotted versions part by part, numerically; missing parts count as 0 (TV-3). */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(p => parseInt(p, 10) || 0);
  const pb = b.split('.').map(p => parseInt(p, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) {
      return diff < 0 ? -1 : 1;
    }
  }
  return 0;
}

/** Pure classification of the version-service reply. Null, empty or malformed bodies fail open. */
export function classifyVersionResponse(response: unknown, installedVersion: string): VersionOutcome {
  if (!response || typeof response !== 'object') {
    return NONE;
  }
  const r = response as VersionResponse;
  const status = r.returnStatus;
  if (!status || typeof status !== 'object') {
    return NONE;
  }
  const message = typeof status.returnMessage === 'string' ? status.returnMessage : '';

  if (String(status.returnCode) === '401') {
    return { kind: 'sessionExpired', message: message || SERVER_ERROR_MESSAGE };
  }
  if (message.trim().toLowerCase() !== SUCCESS) {
    return { kind: 'error', message: message || SERVER_ERROR_MESSAGE };
  }
  if (r.maintenance_flag === 'Y') {
    return { kind: 'maintenance', message: r.maintenance_msg ?? '' };
  }
  const outdated =
    typeof r.version === 'string' &&
    r.status === 'Active' && // TV-4: only enforced when Active
    compareVersions(installedVersion, r.version) < 0;
  if (outdated && typeof r.target_url === 'string') {
    if (r.force_update_flag === 'Y') {
      return { kind: 'mandatory', targetUrl: r.target_url };
    }
    if (r.optional_update === 'Y') {
      return { kind: 'optional', targetUrl: r.target_url };
    }
  }
  return NONE;
}

/** Posts {version, user_agent} and classifies the reply. Any failure fails open (NLH-E04). */
export async function checkAppVersion(): Promise<VersionOutcome> {
  try {
    const installed = getAppVersion();
    const response = await post<unknown>('forceUpdate/Secured', {
      version: installed,
      user_agent: getUserAgentName(),
    });
    return classifyVersionResponse(response, installed);
  } catch {
    return NONE;
  }
}
