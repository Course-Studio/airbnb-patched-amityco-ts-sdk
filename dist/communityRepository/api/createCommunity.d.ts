/**
 * ```js
 * import { createCommunity } from '@amityco/ts-sdk'
 * const created = await createCommunity({ communityId: 'foobar', displayName: 'foobar' })
 * ```
 *
 * Creates an {@link Amity.Community}
 *
 * @param bundle The data necessary to create a new {@link Amity.Community}
 * @returns The newly created {@link Amity.Community}
 *
 * @category Community API
 * @async
 */
export declare const createCommunity: (bundle: Pick<Amity.Community, "displayName" | "avatarFileId" | "description" | "isPublic" | "isOfficial" | "postSetting" | "tags" | "metadata"> & Amity.CommunityStorySettings & {
    userIds?: string[];
    categoryIds?: string[];
    isUniqueDisplayName?: boolean;
}) => Promise<Amity.Cached<Amity.Community>>;
