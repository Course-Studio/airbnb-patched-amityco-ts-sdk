/**
 * ```js
 * import { onCommunityUserRoleAdded } from '@amityco/ts-sdk'
 * const dispose = onCommunityUserRoleAdded((community, member) => {
 *   // ...
 * })
 * ```
 *
 * Fired when a role has been added to {@link Amity.CommunityUser}
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Community Events
 */
export declare const onCommunityUserRoleAdded: (callback: (community: Amity.Community, member: Amity.Membership<"community">[]) => void) => Amity.Unsubscriber;
