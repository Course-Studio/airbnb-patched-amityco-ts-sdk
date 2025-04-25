/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk'
 * const { data: users, prevPage, nextPage, total } = await UserRepository.queryBlockedUsers({ page: Amity.PageRaw, limit: number })
 * ```
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.User} objects
 *
 * @category Block API
 * @async
 */
export declare const queryBlockedUsers: {
    (query?: Amity.QueryBlockedUser): Promise<{
        data: Amity.User[];
    } & Amity.Pages<Amity.PageRaw> & {
        cachedAt: number;
    } & {
        total: number;
    }>;
    /**
     * ```js
     * import { queryBlockedUsers } from '@amityco/ts-sdk'
     * const { data: users } = queryBlockedUsers.locally({ page: 'page_token' })
     * ```
     *
     * Queries a paginable list of {@link Amity.User} objects from cache
     * Search is performed by displayName such as `.startsWith(search)`
     *
     * @param query The query parameters
     * @returns A page of {@link Amity.User} objects
     *
     * @category Block API
     */
    locally(query?: Parameters<typeof queryBlockedUsers>[0]): (Amity.Cached<Amity.Paged<Amity.InternalUser, Amity.PageRaw>> & {
        total: number;
    }) | undefined;
};
