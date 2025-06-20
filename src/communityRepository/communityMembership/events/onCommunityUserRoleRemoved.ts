import { createCommunityMemberEventSubscriber } from './utils';

/**
 * ```js
 * import { onCommunityUserRoleRemoved } from '@amityco/ts-sdk'
 * const dispose = onCommunityUserRoleRemoved((community, member) => {
 *   // ...
 * })
 * ```
 *
 * Fired when a role has been removed from {@link Amity.CommunityUser}
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Community Events
 */
export const onCommunityUserRoleRemoved = (
  callback: (community: Amity.Community, member: Amity.Membership<'community'>[]) => void,
) => createCommunityMemberEventSubscriber('community.roleRemoved', callback);
