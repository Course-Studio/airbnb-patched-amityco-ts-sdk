// TODO: find a way to uniquely identify the device
// import { getStorage } from './storage'
import { safeProcess } from '~/utils/env';
import { VERSION } from '~/version';
import * as localStorage from '../client/utils/localStorage';
import { uuid } from './uuid';
import { getActiveClient } from '~/client/api/activeClient';

type CrossTabResponse = {
  tabId: string;
  type: 'startup' | 'identify';
  tabIndex?: number;
};

let tabIndex = 0;

// This logic is running on browser only
if (typeof BroadcastChannel !== 'undefined' && typeof window !== 'undefined') {
  const tabId = uuid();
  const openedTabs: { [key: CrossTabResponse['tabId']]: CrossTabResponse['tabIndex'] } = {};
  const internalBroadcast = new BroadcastChannel('amity_ts_sdk');
  let debouceTimer: NodeJS.Timeout;

  // Ask nearby opened tabs for indexing
  internalBroadcast.postMessage({ type: 'startup', tabId });

  internalBroadcast.onmessage = ({ data }: { data: CrossTabResponse }) => {
    // Ignore messages from self
    if (data.tabId === tabId) return;

    if (data.type === 'startup') {
      internalBroadcast.postMessage({ type: 'identify', tabId, tabIndex });
    }

    if (data.type === 'identify' && data.tabIndex !== undefined && data.tabId) {
      openedTabs[data.tabId] = data.tabIndex;
      if (!debouceTimer) {
        debouceTimer = setTimeout(() => {
          const sorted = Object.values(openedTabs).sort();
          if (!sorted || sorted.length === 0) return;

          // @ts-ignore
          tabIndex = sorted.reduce((acc: number, currentIndex: number) => {
            if (acc < currentIndex) {
              return acc;
            }

            return currentIndex + 1;
          }, 0);
        }, 15);
      }
    }
  };
}

/** @hidden */
export const getDeviceId = async () => {
  // here maybe put some auto-detection of the device id based on if it's react or not?
  // anyhow we let consumer branch out if they want, but it doesn't mean we shouldn't try to be nice
  // and do things automatically
  // https://www.npmjs.com/package/react-native-device-info#getuniqueid
  // how to make sure that the React native package will not be included when build is for web

  const client = getActiveClient();
  const key = `${client.prefixDeviceIdKey ?? ''}#deviceId`;

  const savedDeviceId = await localStorage.getItem(key);
  if (savedDeviceId) return savedDeviceId;

  const deviceId = `ascWebSdk#${uuid()}`;
  await localStorage.setItem(key, deviceId);
  return deviceId;
};

export const getMQTTClientId = async (userId: Amity.InternalUser['userId']) => {
  const savedDeviceId = await getDeviceId();
  return `mqttjs_${savedDeviceId}_${userId}_${tabIndex}`;
};

/** @hidden */
export const getDeviceModel = () => {
  if (safeProcess.versions?.node) return safeProcess.versions.node;

  if (navigator)
    return `${navigator.product.toLowerCase()}#${navigator.userAgent ?? 'unknown_agent'}`;

  return 'unknown_model';
};

/** @hidden */
export const getDeviceInfo = (): Amity.Device['deviceInfo'] => {
  const model = getDeviceModel();

  return {
    // TODO: replace with: kind: process.versions ? 'node' : 'web', when backend has fixed this
    kind: 'web',
    model,
    sdkVersion: VERSION,
  };
};
