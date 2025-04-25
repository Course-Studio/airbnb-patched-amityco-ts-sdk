import { getActiveClient } from './activeClient';
import { setSessionState } from './setSessionState';

/* begin_public_function
  id: client.logout
*/
/**
 * ```js
 * import { Client } from '@amityco/ts-sdk';
 * const success = await Client.logout()
 * ```
 *
 * Disconnects an {@link Amity.Client} instance from ASC servers
 *
 * @returns a success boolean if disconnected
 *
 * @category Client API
 * @async
 */
export const logout = async (): Promise<boolean> => {
  const client = getActiveClient();

  client.log('client/api/disconnectClient');

  if (client.mqtt && client.mqtt.connected) {
    client.mqtt.disconnect();
  }

  if (client.ws && client.ws.connected) {
    client.ws.disconnect();
  }

  /*
   * for cases when session state is terminated (example on ban) or token expired,
   * the terminating block will set session state to terminated or for the or
   * in the case of expired token the same happens
   *
   * establishing state also ignored in cases where accessTokenExpiryWatcher
   * calls renewal. There is a possibility that renewal will be called before
   * disconnectClient finishes execution
   *
   * IMPORTANT: call this before `emitter.all.clear()`, otherwise the session
   * event will never be triggered
   */
  if (client.sessionState === Amity.SessionStates.ESTABLISHED)
    setSessionState(Amity.SessionStates.NOT_LOGGED_IN);

  client.emitter.all.clear();
  // FIXME: it removes listener in ws.ts, it breaks global ban event
  client.ws?.removeAllListeners();
  client.mqtt?.removeAllListeners();
  client.userId = undefined;
  client.token = undefined;

  client.http.defaults.headers.common.Authorization = '';
  client.http.defaults.metadata = {
    tokenExpiry: '',
    isGlobalBanned: false,
    isUserDeleted: false,
  };

  if (client.ws) client.ws.io.opts.query = { token: '' };

  if (typeof document !== 'undefined') {
    document.cookie = '_ascSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  /*
   * Cache should be usable if tokenExpired
   * https://ekoapp.atlassian.net/wiki/spaces/UP/pages/2082537485/ASC+Core+-+Session+Management+3.0#SDK-usability-based-on-Session-State
   */
  if (client.sessionState !== Amity.SessionStates.TOKEN_EXPIRED && client.cache) {
    client.cache = { data: {} };
  }

  return true;
};
/* end_public_function */
