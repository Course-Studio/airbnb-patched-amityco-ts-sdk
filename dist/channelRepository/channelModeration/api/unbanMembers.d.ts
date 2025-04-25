/**
 * ```js
 * import { unbanMembers } from '@amityco/ts-sdk'
 *
 * await unbanMembers('channel-id-1', ['userId1', 'userId2'])
 * ```
 *
 * @param channelId of {@link Amity.Channel} where the users should be unbanned
 * @param userIds of the {@link Amity.InternalUser}'s to be unbanned
 * @returns the updated {@link Amity.Membership}'s object
 *
 * @category Channel API
 * @async
 * */
export declare const unbanMembers: (channelId: Amity.Channel['channelId'], userIds: Amity.InternalUser['userId'][]) => Promise<Amity.Cached<Amity.Membership<'channel'>[]>>;
