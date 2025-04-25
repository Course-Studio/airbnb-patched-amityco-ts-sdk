/**
 * ```js
 * import { muteMembers } from '@amityco/ts-sdk'
 *
 * await muteMembers('channel-id-1', ['userId1', 'userId2'], 10)
 * ```
 *
 * @param channelId of {@link Amity.Channel} from which the users should be muted
 * @param userIds of the {@link Amity.InternalUser}'s to be muted
 * @param period to be muted in seconds
 * @returns the updated {@link Amity.Membership}'s object
 *
 * @category Channel API
 * @async
 * */
export declare const muteMembers: (channelId: Amity.Channel['channelId'], userIds: Amity.InternalUser['userId'][], mutePeriod?: number) => Promise<boolean>;
