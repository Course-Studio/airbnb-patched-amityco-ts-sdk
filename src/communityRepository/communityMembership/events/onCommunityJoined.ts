import { createCommunityMemberEventSubscriber } from './utils';

/**
 * ```js
 * import { onCommunityJoined } from '@amityco/ts-sdk'
 * const dispose = onCommunityJoined((community, member) => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.Community} has been joined
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Community Events
 */
export const onCommunityJoined = (
  callback: (community: Amity.Community, member: Amity.Membership<'community'>[]) => void,
) => createCommunityMemberEventSubscriber('community.joined', callback);
