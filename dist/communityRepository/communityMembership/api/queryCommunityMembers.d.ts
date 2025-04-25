/**
 * ```js
 * import { queryCommunityMembers } from '@amityco/ts-sdk'
 * const communityMembers = await queryCommunityMembers({ communityId: 'foo' })
 * ```
 *
 * Queries a paginable list of {@link Amity.CommunityUser} objects
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.CommunityUser} objects
 *
 * @category Community API
 * @async
 * */
export declare const queryCommunityMembers: {
    (query: Amity.QueryCommunityMembers): Promise<Amity.Cached<Amity.PageToken<Amity.Membership<'community'>>>>;
    /**
     * ```js
     * import { queryCommunityMembers } from '@amityco/ts-sdk'
     * const communityMembers = await queryCommunityMembers(query)
     * ```
     *
     * Queries a paginable list of {@link Amity.InternalPost} objects from cache
     *
     * @param query The query parameters
     * @returns posts
     *
     * @category Post API
     */
    locally(query: Parameters<typeof queryCommunityMembers>[0]): Amity.Cached<Amity.PageToken<Amity.Membership<'community'>>> | undefined;
};
