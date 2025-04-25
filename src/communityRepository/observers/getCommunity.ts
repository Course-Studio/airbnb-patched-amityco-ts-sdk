import { liveObject } from '~/utils/liveObject';
import { getCommunity as _getCommunity } from '../api/getCommunity';
import { onCommunityUpdated, onCommunityDeleted } from '../events';
import {
  onCommunityUserBanned,
  onCommunityUserUnbanned,
  onCommunityUserChanged,
  onCommunityJoined,
  onCommunityLeft,
  onLocalCommunityJoined,
  onLocalCommunityLeft,
} from '../communityMembership/events';

/* begin_public_function
  id: community.get
*/
/**
 * ```js
 * import { CommunityRepository } from '@amityco/ts-sdk';
 *
 * let community;
 *
 * const unsub = CommunityRepository.getCommunity(communityId, response => {
 *   community = response.data;
 * });
 * ```
 *
 * Observe all mutation on a given {@link Amity.Community}
 *
 * @param communityId the ID of the message to observe
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the community
 *
 * @category Community Live Object
 */
export const getCommunity = (
  communityId: Amity.Community['communityId'],
  callback: Amity.LiveObjectCallback<Amity.Community>,
): Amity.Unsubscriber => {
  return liveObject(communityId, callback, 'communityId', _getCommunity, [
    onCommunityUpdated,
    onCommunityDeleted,
    onCommunityJoined,
    onCommunityLeft,
    onLocalCommunityJoined,
    onLocalCommunityLeft,
    onCommunityUserBanned,
    onCommunityUserUnbanned,
    onCommunityUserChanged,
  ]);
};
/* end_public_function */
