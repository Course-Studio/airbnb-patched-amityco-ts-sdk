import { getActiveClient } from './activeClient';

/**
 * ```js
 * import { isConnected } from '@amityco/ts-sdk'
 * const connected = isConnected()
 * ```
 *
 * Checks if a {@link Amity.Client} instance is connected to ASC servers
 *
 * @returns a success boolean if connected
 *
 * @category Client API
 */
export const isConnected = (): boolean => {
  const client = getActiveClient();
  client.log('client/api/isConnected', client);

  // if client is connected to ws, it means client is connected. If ws is undefined, it means ws is not used.
  const isWsConnected = (client.ws && client.ws.connected) || !!client.ws;

  return !!(
    client.userId &&
    String(client.http.defaults.headers.common?.Authorization)?.length &&
    isWsConnected
  );
};
