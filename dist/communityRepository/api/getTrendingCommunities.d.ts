/**
 * ```js
 * import { CommunityRepository } from '@amityco/ts-sdk'
 * const trendingCommunities = await CommunityRepository.getTrendingCommunities()
 * ```
 *
 * Gets a list of top trending {@link Amity.Community} objects
 *
 * @param query The query parameters
 * @returns A list of {@link Amity.Community} objects
 *
 * @category Community API
 * @async
 * @private
 */
export declare const getTrendingCommunities: (query?: Amity.PageLimit) => Promise<Amity.Cached<Amity.Community[]>>;
