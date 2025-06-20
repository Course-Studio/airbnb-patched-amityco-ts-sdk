import { getDeviceId } from '~/core/device';
import { ACCESS_TOKEN_WATCHER_INTERVAL } from '~/utils/constants';

import { getActiveUser } from './activeUser';
import { setClientToken as refreshToken } from '../utils/setClientToken';
import { getActiveClient } from './activeClient';
import { login } from './login';

/* begin_public_function
  id: client.renew_access_token
*/
/*
 * Renewal defintion accepted by SessionHandler interface
 *
 * Tech Spec:
 * https://ekoapp.atlassian.net/wiki/spaces/UP/pages/2082537485/ASC+Core+-+Session+Management+3.0#Session-Handler
 *
 * @category private
 */
export const renewal = (): Amity.AccessTokenRenewal => {
  let tokenRenewed = false;
  let renewTimeoutId: ReturnType<typeof setTimeout>;

  const client = getActiveClient();

  client.log('initiating access token renewal');
  /*
   * Renews a token if it is hasn't been renewed before. Also marks token as
   * renewed once done
   * Per instance of Renewal, only one renewal is allowed
   */
  const renewToken = async (authToken?: Amity.ConnectClientParams['authToken']): Promise<void> => {
    const { userId, displayName } = getActiveUser();
    const deviceId = await getDeviceId();

    const params = { userId, displayName, authToken, deviceId };

    if (client.sessionState === Amity.SessionStates.TOKEN_EXPIRED && client.sessionHandler) {
      await login(params, client.sessionHandler);
    } else {
      // about to expire

      await refreshToken({
        params,
        options: {
          setAccessTokenCookie: true,
        },
      });
    }

    tokenRenewed = true;

    if (renewTimeoutId) clearTimeout(renewTimeoutId);
  };

  return {
    renew: () => {
      if (tokenRenewed) {
        console.log("'renew' method can be called only once per renewal instance");
        return;
      }
      renewToken();
    },

    renewWithAuthToken: (authToken: string) => {
      if (tokenRenewed) {
        console.log("'renewWithAuthToken' method can be called only once per renewal instance");
        return;
      }
      renewToken(authToken);
    },

    unableToRetrieveAuthToken: () => {
      renewTimeoutId = setTimeout(() => {
        client.sessionHandler?.sessionWillRenewAccessToken(renewal());
      }, ACCESS_TOKEN_WATCHER_INTERVAL);
    },
  };
};
/* end_public_function */
