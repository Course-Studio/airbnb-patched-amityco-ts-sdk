import { VERSION } from '~/version';

import { createLogger } from '~/core/debug';

import { API_REGIONS, computeUrl } from '~/client/utils/endpoints';
import {
  createHttpTransport,
  createMqttTransport,
  createWebsocketTransport,
} from '~/core/transports';

import { createEventEmitter } from '~/core/events';

import { getMessagePreviewSetting } from '~/client/utils/messagePreviewEngine';
import { getSocialSettings } from '~/client/api/getSocialSettings';
import { hasPermission } from '~/client/utils/hasPermission';
import { validateUrls } from './validateUrls';
import { validateTexts } from './validateTexts';
import { getActiveClient, setActiveClient } from './activeClient';
import { getFeedSettings } from './getFeedSettings';

import { accessTokenExpiryWatcher } from './accessTokenExpiryWatcher';
import { getMarkerSyncConsistentMode } from '../utils/markerSyncEngine';

const DEFAULT_DEBUG_SESSION = 'amity';

/**
 * ```js
 * import { createClient } from '@amityco/ts-sdk'
 * const client = createClient(apiKey, 'https://asc.server/', 'myClient')
 * ```
 *
 * Creates a new {@link Amity.Client} instance
 *
 * @param apiKey for the {@link Amity.Client} instance
 * @param apiRegion endpoint to connect to
 * @param apiEndpoint custom endpoint in case you don't want to use a preset endpoint
 * @param param.debugSession session's identifier for the client's logger instance
 * @returns A {@link Amity.Client} instance
 *
 * @category Client API
 * */
export const createClient = (
  apiKey: string,
  apiRegion: typeof API_REGIONS[keyof typeof API_REGIONS] = API_REGIONS.SG,
  {
    debugSession = DEFAULT_DEBUG_SESSION,
    apiEndpoint,
    prefixDeviceIdKey,
    rteEnabled = true,
  }: {
    debugSession?: string;
    apiEndpoint?: { http?: string; mqtt?: string; upload?: string };
    prefixDeviceIdKey?: string;
    rteEnabled?: boolean;
  } = {},
): Amity.Client => {
  const log = createLogger(debugSession);

  log('client/api/createClient', {
    apiKey: apiKey.replace(/.{5}$/g, 'xxxxx'),
    apiRegion,
  });

  const httpEndpoint = apiEndpoint?.http ?? computeUrl('http', apiRegion);
  const uploadEndpoint = apiEndpoint?.upload ?? computeUrl('upload', apiRegion);
  const mqttEndpoint = apiEndpoint?.mqtt ?? computeUrl('mqtt', apiRegion);

  const http = createHttpTransport(httpEndpoint);
  const upload = createHttpTransport(uploadEndpoint);

  let ws;
  let mqtt;

  if (rteEnabled) {
    ws = createWebsocketTransport(httpEndpoint);
    mqtt = createMqttTransport(mqttEndpoint);
  }

  const emitter = createEventEmitter();

  /*
   * Since v6 cache is enabled by default
   */
  const cache = { data: {} };

  const sessionState = Amity.SessionStates.NOT_LOGGED_IN;
  const sessionHandler = undefined;

  const isUnreadCountEnabled = false;
  // Legacy unread count is true by default
  const useLegacyUnreadCount = true;

  const client = {
    version: `${VERSION}`,
    apiKey,

    /*
     * SDK Components
     */
    log,
    cache,

    /*
     * Network components
     */
    http,
    ws,
    mqtt,
    upload,
    emitter,

    /*
     * Session Components
     */
    sessionState,
    accessTokenExpiryWatcher,
    sessionHandler,

    hasPermission,
    validateUrls,
    validateTexts,
    getFeedSettings,
    getSocialSettings,
    getMessagePreviewSetting,

    use: () => setActiveClient(client),

    isUnreadCountEnabled,
    useLegacyUnreadCount,

    getMarkerSyncConsistentMode,

    /**
     * Prefix for the deviceId key in the local storage or async storage.
     * This is allow user to have multiple SDK client and Mqtt client within the same app.
     */
    prefixDeviceIdKey,
  };

  try {
    const activeClient = getActiveClient();
    if (activeClient.apiKey === apiKey) return activeClient;

    setActiveClient(client);
  } catch {
    setActiveClient(client);
  }

  return client;
};
