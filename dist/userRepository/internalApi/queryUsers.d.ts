/**
 * ```js
 * import { queryUsers } from '@amityco/ts-sdk'
 * const { data: users, prevPage, nextPage } = await queryUsers({ displayName: 'foo' })
 * ```
 *
 * Queries a paginable list of {@link Amity.InternalUser} objects
 * Search is performed by displayName such as `.startsWith(search)`
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.InternalUser} objects
 *
 * @category User API
 * @async
 */
export declare const queryUsers: {
    (query?: Amity.QueryUsers): Promise<Amity.Cached<Amity.PageToken<Amity.InternalUser>>>;
    /**
     * ```js
     * import { queryUsers } from '@amityco/ts-sdk'
     * const { data: users } = queryUsers.locally({ keyword: 'foo' })
     * ```
     *
     * Queries a paginable list of {@link Amity.InternalUser} objects from cache
     * Search is performed by displayName such as `.startsWith(search)`
     *
     * @param query The query parameters
     * @returns A page of {@link Amity.InternalUser} objects
     *
     * @category User API
     */
    locally(query?: Parameters<typeof queryUsers>[0]): Amity.Cached<Amity.PageToken<Amity.InternalUser>> | undefined;
};
