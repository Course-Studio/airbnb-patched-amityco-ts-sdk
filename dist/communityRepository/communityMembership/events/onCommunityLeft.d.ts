/**
 * ```js
 * import { onCommunityLeft } from '@amityco/ts-sdk'
 * const dispose = onCommunityLeft((community, member) => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.Community} has been left
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Community Events
 */
export declare const onCommunityLeft: (callback: (community: Amity.Community, member: Amity.Membership<"community">[]) => void) => Amity.Unsubscriber;
