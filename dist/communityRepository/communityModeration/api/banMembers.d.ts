/**
 * ```js
 * import { CommunityRepository } from '@amityco/ts-sdk'
 *
 * await CommunityRepository.Moderation.banMembers('communityId', ['userId1', 'userId2'])
 * ```
 *
 * @param communityId of {@link Amity.Community} from which the users should be banned
 * @param userIds of the {@link Amity.InternalUser}'s to be banned
 * @returns the updated {@link Amity.Membership}'s object
 *
 * @category Community API
 * @async
 * */
export declare const banMembers: (communityId: Amity.Community["communityId"], userIds: Amity.InternalUser["userId"][]) => Promise<Amity.Cached<Amity.Membership<"community">[]>>;
