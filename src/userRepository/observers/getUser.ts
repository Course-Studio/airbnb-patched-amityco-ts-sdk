import { liveObject } from '~/utils/liveObject';
import {
  onUserDeleted,
  onUserUpdated,
  onUserFlagCleared,
  onUserFlagged,
  onUserUnflagged,
} from '../events';
import { onUserFetched } from '../events/onUserFetched';
import { getUser as _getUser } from '../internalApi/getUser';
import { LinkedObject } from '~/utils/linkedObject';

/* begin_public_function
  id: user.get
*/
/**
 * ```js
 * import { liveUser } from '@amityco/ts-sdk';
 *
 * let user;
 *
 * const unsubscribe = liveUser(userId, response => {
 *   user = response.data;
 * });
 * ```
 *
 * Observe all mutation on a given {@link Amity.User}
 *
 * @param userId the ID of the user to observe
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the user
 *
 * @category Message Live Object
 */
export const getUser = (
  userId: Amity.User['userId'],
  callback: Amity.LiveObjectCallback<Amity.User>,
): Amity.Unsubscriber => {
  const reactor = (
    response: Amity.LiveObject<Amity.InternalUser>,
  ): Amity.LiveObjectCallback<Amity.User> => {
    return callback({
      ...response,
      data: response.data ? LinkedObject.user(response.data) : response.data,
    });
  };

  return liveObject(userId, reactor, 'userId', _getUser, [
    onUserFetched,
    onUserUpdated,
    onUserDeleted,
    onUserFlagged,
    onUserUnflagged,
    onUserFlagCleared,
  ]);
};
/* end_public_function */
