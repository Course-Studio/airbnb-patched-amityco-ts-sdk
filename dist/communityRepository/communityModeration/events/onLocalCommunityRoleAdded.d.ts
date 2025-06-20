/**
 * ```js
 * import { onLocalCommunityRoleAdded } from '@amityco/ts-sdk'
 * const dispose = onLocalCommunityRoleAdded((community, member) => {
 *   // ...
 * })
 * ```
 *
 * Fired when any {@link Amity.communityUsers} 's role has been added to any {@link Amity.Community}
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Community Events
 */
export declare const onLocalCommunityRoleAdded: (callback: (community: Amity.Community, member: Amity.Membership<"community">[]) => void) => Amity.Unsubscriber;
