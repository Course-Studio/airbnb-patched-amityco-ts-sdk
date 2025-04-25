/* eslint-disable no-param-reassign */
import { getActiveClient } from './activeClient';
import { setActiveUser } from './activeUser';
import { logout } from './logout';
import { setSessionState } from './setSessionState';
import { terminateClient } from './terminateClient';
import analyticsEngineOnLoginHandler from '~/analytic/utils/analyticsEngineOnLoginHandler';
import { onChannelDeleted } from '~/channelRepository/events/onChannelDeleted';
import { onChannelMemberBanned } from '~/channelRepository/events/onChannelMemberBanned';
import { modifyMqttConnection } from '~/client/utils/modifyMqttConnection';
import objectResolverEngineOnLoginHandler from '~/client/utils/ObjectResolver/objectResolverEngineOnLoginHandler';
import legacyReadReceiptSyncEngineOnLoginHandler from '~/client/utils/ReadReceiptSync/legacyReadReceiptSyncEngineOnLoginHandler';
import readReceiptSyncEngineOnLoginHandler from '~/client/utils/ReadReceiptSync/readReceiptSyncEngineOnLoginHandler';
/* eslint-disable require-atomic-updates */
import { ASCError } from '~/core/errors';
import { proxyWebsocketEvents } from '~/core/events';
import { markReadEngineOnLoginHandler } from '~/subChannelRepository/utils/markReadEngine';
import { onUserDeleted } from '~/userRepository/events/onUserDeleted';
import { onClientBanned } from '../events';
import { onTokenExpired } from '../events/onTokenExpired';
import { onTokenTerminated } from '../events/onTokenTerminated';
import { startMarkerSync } from '../utils/markerSyncEngine';
import { initializeMessagePreviewSetting } from '../utils/messagePreviewEngine';
import { removeChannelMarkerCache } from '../utils/removeChannelMarkerCache';
import SessionWatcher from '../utils/SessionWatcher';

/*
 * declared earlier to accomodate case when logging in with a different user
 * than the one already connected, in which case the existing subscriptions need
 * to be cleared
 */
let subscriptions: Amity.Unsubscriber[] = [];

async function runMqtt() {
  await modifyMqttConnection();
}

interface Params {
  userId: string;
  token: {
    issuedAt: string;
    expiresAt: string;
    accessToken: string;
  };
}

/* begin_public_function
  id: client.login
*/
/**
 * ```js
 * import { login } from '@amityco/ts-sdk/client/api'
 * const success = await login({
 *   userId: 'XYZ123456789',
 * })
 * ```
 *
 * Connects an {@link Amity.Client} instance to ASC servers
 *
 * @param params the connect parameters
 * @param params.userId the user ID for the current session
 * @param params.displayName the user's displayName for the current session
 * @param params.deviceId Manual override of the user's device id (for device management)
 * @param params.authToken The authentication token - necessary when network option is set to secure
 * @returns a success boolean if connected
 *
 * @category Client API
 * @async
 */
export const useAccessToken = async (
  params: Params,
  sessionHandler: Amity.SessionHandler,
  config?: Amity.ConnectClientConfig,
): Promise<boolean> => {
  const client = getActiveClient();
  let unsubWatcher: Amity.Unsubscriber;

  client.log('client/api/useAuthToken', {
    apiKey: client.apiKey,
    sessionState: client.sessionState,
    ...params,
  });

  // if connecting to a different userId than the one that is connected currently
  if (client.userId && client.userId !== params.userId) {
    await logout();

    // Remove subscription to ban and delete
    subscriptions.forEach((fn) => fn());
    subscriptions = [];
  }

  try {
    const user = await validateAccessToken(params);

    if (user == null) {
      throw new ASCError(
        `${params.userId} has not been founded`,
        Amity.ClientError.UNKNOWN_ERROR,
        Amity.ErrorLevel.ERROR,
      );
    }

    if (user.isDeleted) {
      terminateClient(Amity.TokenTerminationReason.USER_DELETED);
      return false;
    }

    if (user.isGlobalBanned) {
      terminateClient(Amity.TokenTerminationReason.GLOBAL_BAN);
      return false;
    }

    // FIXME: events are duplicated if connectClient is called few times without disconnectClient
    // wire websocket events to our event emitter
    proxyWebsocketEvents(client.ws, client.emitter);

    client.ws?.open();

    client.userId = user.userId;

    client.sessionHandler = sessionHandler;

    /*
     * Cannot push to subscriptions as watcher needs to continue working even if
     * token expires
     */
    unsubWatcher = client.accessTokenExpiryWatcher(sessionHandler);

    setActiveUser(user);
  } catch (error) {
    /*
     * if getting token failed session state reverts to initial state when app
     * is first launched
     */
    SessionWatcher.getInstance().setSessionState(Amity.SessionStates.NOT_LOGGED_IN);

    // pass error down tree so the calling function handle it
    throw error;
  }

  if (config?.disableRTE !== true) {
    runMqtt();
  }

  await initializeMessagePreviewSetting();

  if (subscriptions.length === 0) {
    subscriptions.push(
      // GLOBAL_BAN
      onClientBanned((_: Amity.UserPayload) => {
        terminateClient(Amity.TokenTerminationReason.GLOBAL_BAN);

        subscriptions.forEach((fn) => fn());

        unsubWatcher();
      }),

      onTokenTerminated((_) => {
        terminateClient();

        subscriptions.forEach((fn) => fn());

        unsubWatcher();
      }),

      onUserDeleted((user: Amity.InternalUser) => {
        if (user.userId === client.userId) {
          terminateClient(Amity.TokenTerminationReason.USER_DELETED);

          subscriptions.forEach((fn) => fn());

          unsubWatcher();
        }
      }),

      onTokenExpired((state) => {
        SessionWatcher.getInstance().setSessionState(state);

        logout();

        subscriptions.forEach((fn) => fn());
      }),

      // NOTE: This is a temporary solution to handle the channel marker when the user is forced to leave
      // the channel because currently backend can't handle this, so every time a user is banned from
      // a channel or the channel is deleted the channel's unread count will not be reset to zero
      onChannelDeleted(removeChannelMarkerCache),
      onChannelMemberBanned(removeChannelMarkerCache),

      markReadEngineOnLoginHandler(),
      analyticsEngineOnLoginHandler(),
      objectResolverEngineOnLoginHandler(),
    );

    if (client.useLegacyUnreadCount) {
      subscriptions.push(readReceiptSyncEngineOnLoginHandler());
    } else subscriptions.push(legacyReadReceiptSyncEngineOnLoginHandler());

    const markerSyncUnsubscriber = await startMarkerSync();
    subscriptions.push(markerSyncUnsubscriber);
  }

  return true;
};
/* end_public_function */

/**
 * A util to validate client token and get current user data
 *
 * @param params.userId the user ID for the current session
 * @param params.displayName the user's displayName for the current session
 * @param params.deviceId Manual override of the user's device id (for device management)
 * @param params.authToken The authentication token - necessary when network option is set to secure
 * @returns token & user info
 *
 * @category private
 * @async
 */
export const validateAccessToken = async ({ token, userId }: Params) => {
  const client = getActiveClient();
  // begin establishing session
  setSessionState(Amity.SessionStates.ESTABLISHING);

  // manually setup the token for http transport
  client.http.defaults.headers.common.Authorization = `Bearer ${token.accessToken}`;

  const {
    data: { users },
  } = await client.http.get<{ users: Amity.InternalUser[] }>(`/api/v3/users/${userId}`);

  const user = users.find((u) => u.userId === userId);

  client.http.defaults.metadata = {
    tokenExpiry: token.expiresAt,
    isGlobalBanned: false,
    isUserDeleted: false,
  };

  client.upload.defaults.headers.common.Authorization = `Bearer ${token.accessToken}`;

  client.upload.defaults.metadata = {
    tokenExpiry: token.expiresAt,
    isGlobalBanned: false,
    isUserDeleted: false,
  };

  // manually setup the token for ws transport
  if (client.ws) client.ws.io.opts.query = { token: token.accessToken };

  client.token = token;

  setSessionState(Amity.SessionStates.ESTABLISHED);

  return user;
};
