/**
 * ```js
 * import { onCommunityUserChanged } from '@amityco/ts-sdk'
 * const dispose = onCommunityUserChanged((community, member) => {
 *   // ...
 * })
 * ```
 *
 * Fired when a user has been added or removed from a {@link Amity.Community}
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Community Events
 */
export declare const onCommunityUserChanged: (callback: (community: Amity.Community, members: Amity.Membership<"community">[]) => void) => Amity.Unsubscriber;
