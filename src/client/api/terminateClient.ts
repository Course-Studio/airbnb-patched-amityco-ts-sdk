import { logout } from './logout';
import { setSessionState } from './setSessionState';
import { getActiveClient } from './activeClient';

/**
 * Terminates {@link Amity.Client} instance
 *
 *
 *
 * @category private
 */
export const terminateClient = (terminationReason?: Amity.TokenTerminationReason) => {
  const client = getActiveClient();

  setSessionState(Amity.SessionStates.TERMINATED);

  if (client.http.defaults.metadata) {
    if (terminationReason === Amity.TokenTerminationReason.GLOBAL_BAN)
      client.http.defaults.metadata.isGlobalBanned = true;

    if (terminationReason === Amity.TokenTerminationReason.USER_DELETED)
      client.http.defaults.metadata.isUserDeleted = true;
  }

  client.sessionHandler = undefined;

  logout();
};
