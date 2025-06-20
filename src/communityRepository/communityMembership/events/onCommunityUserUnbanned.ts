import { createCommunityMemberEventSubscriber } from './utils';

/**
 * ```js
 * import { onCommunityUserUnbanned } from '@amityco/ts-sdk'
 * const dispose = onCommunityUserUnbanned((community, member) => {
 *   // ...
 * })
 * ```
 *
 * Fired when a user has been unbanned from a {@link Amity.Community}
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Community Events
 */
export const onCommunityUserUnbanned = (
  callback: (community: Amity.Community, member: Amity.Membership<'community'>[]) => void,
) => createCommunityMemberEventSubscriber('community.userUnbanned', callback);
