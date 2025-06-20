/**
 * ```js
 * import { updateCommunity } from '@amityco/ts-sdk'
 * const updated = await updateCommunity(communityId, { displayName: 'foobar' })
 * ```
 *
 * Updates an {@link Amity.Community}
 *
 * @param communityId The ID of the {@link Amity.Community} to edit
 * @param patch The patch data to apply
 * @returns the updated {@link Amity.Community} object
 *
 * @category Community API
 * @async
 */
export declare const updateCommunity: (communityId: Amity.Community["communityId"], patch: Patch<Amity.Community, "displayName" | "avatarFileId" | "description" | "postSetting" | "tags" | "metadata"> & Amity.CommunityStorySettings) => Promise<Amity.Cached<Amity.Community>>;
