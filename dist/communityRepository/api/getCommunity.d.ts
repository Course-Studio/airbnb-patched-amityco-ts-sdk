/**
 * ```js
 * import { CommunityRepository } from '@amityco/ts-sdk'
 * const community = await CommunityRepository.getCommunity('foobar')
 * ```
 *
 * Fetches a {@link Amity.Community} object
 *
 * @param communityId the ID of the {@link Amity.Community} to fetch
 * @returns the associated {@link Amity.Community} object
 *
 * @category Community API
 * @async
 */
export declare const getCommunity: {
    (communityId: Amity.Community['communityId']): Promise<Amity.Cached<Amity.Community>>;
    /**
     * ```js
     * import { CommunityRepository } from '@amityco/ts-sdk'
     * const community = CommunityRepository.getCommunity.locally('foobar')
     * ```
     *
     * Fetches a {@link Amity.Community} object from cache
     *
     * @param communityId the ID of the {@link Amity.Community} to fetch
     * @returns the associated {@link Amity.Community} object
     *
     * @category Community API
     */
    locally(communityId: Amity.Community['communityId']): Amity.Cached<Amity.Community> | undefined;
};
