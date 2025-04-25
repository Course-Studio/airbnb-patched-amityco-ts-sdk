/**
 * ```js
 * import { onUserDeleted } from '@amityco/ts-sdk'
 * const dispose = onUserDeleted((community, member) => {
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
export declare const onUserDeleted: (communityId: string) => (callback: (community: Amity.Community, member: Amity.Membership<'community'>[]) => void) => Amity.Unsubscriber;
