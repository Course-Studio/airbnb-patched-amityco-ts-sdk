import { getActiveUser } from '~/client';
import { liveObject } from '~/utils/liveObject';
import { getFollowInfo as _getFollowInfo } from '../api/getFollowInfo';
import { onFollowInfoUpdated } from '../events';

/* begin_public_function
  id: user.relationship.get_my_follow_info
*/
/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk';
 *
 * let myFollowInfo;
 *
 * const unsubscribe = UserRepository.Relationship.getMyFollowInfo(response => {
 *   myFollowInfo = response.data;
 * });
 * ```
 *
 * Observe all mutation on the current users {@link Amity.FollowCount} object
 *
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing
 *
 * @category FollowInfo Live Object
 */
export const getMyFollowInfo = (
  callback: Amity.LiveObjectCallback<Amity.FollowInfo>,
): Amity.Unsubscriber => {
  const { userId } = getActiveUser();

  return liveObject(userId, callback, 'userId', _getFollowInfo, [onFollowInfoUpdated], {
    /*
     * Required as Amity.FollowInfo does not extend Amity.Timestamps
     */
    forceDispatch: true,
  });
};
/* end_public_function */
