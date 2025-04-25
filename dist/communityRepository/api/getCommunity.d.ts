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
    (communityId: Amity.Community["communityId"]): Promise<Amity.Cached<Amity.Community>>;
    locally(communityId: Amity.Community["communityId"]): Amity.Cached<Amity.Community> | undefined;
};
