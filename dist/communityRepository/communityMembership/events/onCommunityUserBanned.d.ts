/**
 * ```js
 * import { onCommunityUserBanned } from '@amityco/ts-sdk'
 * const dispose = onCommunityUserBanned((community, member) => {
 *   // ...
 * })
 * ```
 *
 * Fired when a user has been banned from a {@link Amity.Community}
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Community Events
 */
export declare const onCommunityUserBanned: (callback: (community: Amity.Community, member: Amity.Membership<"community">[]) => void) => Amity.Unsubscriber;
