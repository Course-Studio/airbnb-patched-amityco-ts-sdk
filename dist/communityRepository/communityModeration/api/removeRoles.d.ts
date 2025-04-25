/**
 * ```js
 * import { CommunityRepository } from '@amityco/ts-sdk'
 * const updated = await CommunityRepository.moderation.removeRoles(communityId, ['foo', 'bar'])
 * ```
 *
 * Removes a list of {@link Amity.Role} from a list of {@link Amity.InternalUser} on a {@link Amity.Community}
 *
 * @param communityId The ID of the {@link Amity.Community} to perform
 * @param roleIds Array of IDs of the {@link Amity.Role} to apply
 * @param userIds Array of IDs of the {@link Amity.InternalUser} to perform
 * @returns A success boolean if the {@link Amity.Role} were removed from list of {@link Amity.InternalUser} in the {@link Amity.Community}
 *
 * @category Community API
 * @async
 */
export declare const removeRoles: (communityId: Amity.Community['communityId'], roleIds: Amity.Role['roleId'][], userIds: Amity.InternalUser['userId'][]) => Promise<boolean>;
