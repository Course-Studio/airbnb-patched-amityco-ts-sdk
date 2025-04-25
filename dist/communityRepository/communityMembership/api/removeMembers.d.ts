/**
 * ```js
 * import { CommunityRepository } from '@amityco/ts-sdk'
 * const updated = await CommunityRepository.moderation.removeMembers(communityId, ['foo', 'bar'])
 * ```
 *
 * Removes a list of {@link Amity.InternalUser} from a {@link Amity.Community}
 *
 * @param communityId The ID of the {@link Amity.Community} to edit
 * @param userIds The list of IDs {@link Amity.InternalUser} to remove
 * @returns A success boolean if the list of {@link Amity.InternalUser} were removed from the {@link Amity.Community}
 *
 * @category Community API
 * @async
 */
export declare const removeMembers: (communityId: Amity.Community["communityId"], userIds: Amity.InternalUser["userId"][]) => Promise<boolean>;
