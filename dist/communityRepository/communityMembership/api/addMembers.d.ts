/**
 * ```js
 * import { CommunityRepository } from '@amityco/ts-sdk'
 * const updated = await CommunityRepository.moderation.addMembers(communityId, ['foo', 'bar'])
 * ```
 *
 * Adds a list of {@link Amity.InternalUser} to a {@link Amity.Community} to add users to
 *
 * @param communityId The ID of the {@link Amity.Community} to perform
 * @param userIds The list of IDs {@link Amity.InternalUser} to add
 * @returns A success boolean if the {@link Amity.InternalUser} were added to the {@link Amity.Community}
 *
 * @category Community API
 * @async
 */
export declare const addMembers: (communityId: Amity.Community["communityId"], userIds: Amity.InternalUser["userId"][]) => Promise<boolean>;
