import { Platform } from 'react-native';

type MutablePlatform = { OS: string };

const original = Platform.OS;

/** Test helper: switch Platform.OS without touching other global mocks. */
export function setPlatformOS(os: 'android' | 'ios'): void {
  (Platform as unknown as MutablePlatform).OS = os;
}

export function restorePlatformOS(): void {
  (Platform as unknown as MutablePlatform).OS = original;
}
