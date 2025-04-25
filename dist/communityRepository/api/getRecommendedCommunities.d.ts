/**
 * ```js
 * import { CommunityRepository } from '@amityco/ts-sdk'
 * const communities = await CommunityRepository.getRecommendedCommunities()
 * ```
 *
 * Gets a list of recommended {@link Amity.Community} objects
 *
 * @param query The query parameters
 * @returns A list of {@link Amity.Community} objects
 *
 * @category Community API
 * @async
 * @private
 */
export declare const getRecommendedCommunities: (query?: Amity.PageLimit) => Promise<Amity.Cached<Amity.Community[]>>;
