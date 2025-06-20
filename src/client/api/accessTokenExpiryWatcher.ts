import { fireEvent } from '~/core/events';
import { scheduleTask } from '~/core/microtasks';
import { MINUTE, ACCESS_TOKEN_WATCHER_INTERVAL } from '~/utils/constants';

import { renewal } from './renewal';
import { getActiveClient } from './activeClient';

const ABOUT_TO_EXPIRE_THRESHOLD = 80 / 100;
const COMPENSATED_DELAY = 5 * MINUTE;

/*
 * a helper function to check if the token has expires
 *
 * @param token to be checked
 * @returns boolean indicating if token expires
 *
 * @category private
 */
export const isExpired = (expiresAt: Amity.Tokens['expiresAt']): boolean =>
  Date.now() > Date.parse(expiresAt) - COMPENSATED_DELAY;

/*
 * a helper function to check if the token is about to expire
 *
 * @param token to be checked
 * @returns boolean indicating if token is aboutToExpire
 *
 * @category private
 */
export const isAboutToExpire = (params: {
  expiresAt: Amity.Tokens['expiresAt'];
  issuedAt: Amity.Tokens['issuedAt'];
}): boolean => {
  const { expiresAt, issuedAt } = params;

  const expires = Date.parse(expiresAt);
  const issued = Date.parse(issuedAt);
  const now = Date.now();

  const duration = expires - issued - COMPENSATED_DELAY;
  const aboutToExpireAt = issued + duration * ABOUT_TO_EXPIRE_THRESHOLD;

  return now > aboutToExpireAt && now < expires;
};

/*
 * Monitors time to expire of token and updates session state to aboutToExpire
 *
 * @returns intervalId to be cleared after trigger
 *
 * @category private
 */
export const accessTokenExpiryWatcher = (
  sessionHandler: Amity.SessionHandler,
): Amity.Unsubscriber => {
  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    const client = getActiveClient();

    if (!client.token) return;

    const { issuedAt, expiresAt } = client.token;

    if (isExpired(expiresAt)) {
      /*
       * the event handler will take care of updating session state
       * Note, this will also clear the interval id, so this event will only be
       * fired once
       */
      fireEvent('tokenExpired', Amity.SessionStates.TOKEN_EXPIRED);

      /*
       * https://ekoapp.atlassian.net/wiki/spaces/UP/pages/2082537485/ASC+Core+-+Session+Management+3.0#Automatically-initiate-renewal-flow
       *
       * Why sechduled task?
       * Since fireEvent is scheduled, it will be called
       * after sessionHandler leading to an invalid state change from
       * establishing to tokenExpired
       */
      scheduleTask(() => sessionHandler.sessionWillRenewAccessToken(renewal()));

      return;
    }

    if (isAboutToExpire({ expiresAt, issuedAt })) {
      sessionHandler.sessionWillRenewAccessToken(renewal());
    }
  }, ACCESS_TOKEN_WATCHER_INTERVAL);

  return (): void => clearInterval(interval);
};
