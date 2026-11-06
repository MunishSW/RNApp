import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export type PlatformName = 'android' | 'ios';
/** Capitalised value the version service matches case-sensitively (TV-5). */
export type UserAgentName = 'Android' | 'iOS';

export function getAppVersion(): string {
  return DeviceInfo.getVersion();
}

export function getPlatform(): PlatformName {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}

export function getUserAgentName(): UserAgentName {
  return Platform.OS === 'ios' ? 'iOS' : 'Android';
}

/** Device details JSON for the `device-details` header. No unique ids, no personal data. */
export function getDeviceDetails(): string {
  return JSON.stringify({
    platform: getPlatform(),
    brand: DeviceInfo.getBrand(),
    model: DeviceInfo.getModel(),
    systemVersion: DeviceInfo.getSystemVersion(),
  });
}
