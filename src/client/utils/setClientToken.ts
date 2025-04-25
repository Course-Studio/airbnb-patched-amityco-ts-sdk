import { getActiveClient } from '../api/activeClient';
import { setSessionState } from '../api/setSessionState';
import { getToken } from '../api/getToken';

/**
 * A util to set or refresh client token
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
export const setClientToken = async (params: Parameters<typeof getToken>[0]) => {
  const client = getActiveClient();
  // begin establishing session
  setSessionState(Amity.SessionStates.ESTABLISHING);

  const { accessToken, users, expiresAt, issuedAt } = await getToken(params);

  // manually setup the token for http transport
  client.http.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

  client.http.defaults.metadata = {
    tokenExpiry: expiresAt,
    isGlobalBanned: false,
    isUserDeleted: false,
  };

  client.upload.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

  client.upload.defaults.metadata = {
    tokenExpiry: expiresAt,
    isGlobalBanned: false,
    isUserDeleted: false,
  };

  // manually setup the token for ws transport
  if (client.ws) client.ws.io.opts.query = { token: accessToken };

  client.token = { accessToken, issuedAt, expiresAt };

  setSessionState(Amity.SessionStates.ESTABLISHED);

  return { accessToken, users };
};
