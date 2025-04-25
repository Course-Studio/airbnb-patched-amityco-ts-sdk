import { liveObject } from '~/utils/liveObject';
import { getFollowInfo as _getFollowInfo } from '../api/getFollowInfo';
import { onFollowInfoUpdated } from '../events';

/* begin_public_function
  id: user.relationship.get_follow_info
*/
/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk';
 *
 * let followInfo;
 *
 * const unsubscribe = UserRepository.Relationship.getFollowInfo(userId, response => {
 *   followInfo = response.data;
 * });
 * ```
 *
 * Observe all mutation on a given {@link Amity.FollowCount} object
 *
 * @param userId the ID of the current user
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing
 *
 * @category FollowInfo Live Object
 */
export const getFollowInfo = (
  userId: Amity.FollowInfo['userId'],
  callback: Amity.LiveObjectCallback<Amity.FollowInfo>,
): Amity.Unsubscriber => {
  return liveObject(userId, callback, 'userId', _getFollowInfo, [onFollowInfoUpdated], {
    forceDispatch: true,
  });
};
/* end_public_function */
