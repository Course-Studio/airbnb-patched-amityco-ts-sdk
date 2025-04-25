import { createLocalCommunityMemberEventSubscriber } from './utils';

/**
 * ```js
 * import { onLocalCommunityUserAdded } from '@amityco/ts-sdk'
 * const dispose = onLocalCommunityUserAdded((community, member) => {
 *   // ...
 * })
 * ```
 *
 * Fired when a user has been added to a {@link Amity.Community}
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Community Events
 */
export const onLocalCommunityUserAdded = (
  callback: (community: Amity.Community, member: Amity.Membership<'community'>[]) => void,
) => createLocalCommunityMemberEventSubscriber('local.community.userAdded', callback);
