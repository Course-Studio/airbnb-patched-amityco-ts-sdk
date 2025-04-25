/**
 * ```js
 * import { banMembers } from '@amityco/ts-sdk'
 *
 * await banMembers('channel-id-1', ['userId1', 'userId2'])
 * ```
 *
 * @param channelId of {@link Amity.Channel} from which the users should be banned
 * @param userIds of the {@link Amity.InternalUser}'s to be banned
 * @returns the updated {@link Amity.Membership}'s object
 *
 * @category Channel API
 * @async
 * */
export declare const banMembers: (channelId: Amity.Channel['channelId'], userIds: Amity.InternalUser['userId'][]) => Promise<Amity.Cached<Amity.Membership<'channel'>[]>>;
//# sourceMappingURL=banMembers.d.ts.map