import { getActiveClient } from '~/client/api/activeClient';
import { createEventSubscriber } from '~/core/events';

/**
 * ```js
 * import { onLocalCommunityRoleRemoved } from '@amityco/ts-sdk'
 * const dispose = onLocalCommunityRoleRemoved((community, member) => {
 *   // ...
 * })
 * ```
 *
 * Fired when any {@link Amity.communityUsers} 's role has been added to any {@link Amity.Community}
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Community Events
 */
export const onLocalCommunityRoleRemoved = (
  callback: (community: Amity.Community, member: Amity.Membership<'community'>[]) => void,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const filter = async (payload: Amity.ProcessedCommunityMembershipPayload) => {
    const { communities, communityUsers } = payload;
    callback(
      communities[0],
      communityUsers.filter(communityUser => communityUser.communityMembership === 'member')!,
    );
  };

  return createEventSubscriber(
    client,
    'onLocalCommunityRoleRemoved',
    'local.community.roleRemoved',
    filter,
  );
};
