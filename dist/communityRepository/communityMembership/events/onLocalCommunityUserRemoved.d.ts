/**
 * ```js
 * import { onLocalCommunityUserRemoved } from '@amityco/ts-sdk'
 * const dispose = onLocalCommunityUserRemoved((community, member) => {
 *   // ...
 * })
 * ```
 *
 * Fired when a user has been removed from a {@link Amity.Community}
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Community Events
 */
export declare const onLocalCommunityUserRemoved: (callback: (community: Amity.Community, member: Amity.Membership<"community">[]) => void) => Amity.Unsubscriber;
