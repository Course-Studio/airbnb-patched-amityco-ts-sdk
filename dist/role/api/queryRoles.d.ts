/**
 * ```js
 * import { queryRoles } from '@amityco/ts-sdk'
 * const roles = await queryRoles()
 * ```
 *
 * Queries a paginable list of {@link Amity.Role} objects
 * Search is performed by displayName such as `.startsWith(search)`
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.Role} objects
 *
 * @category Role API
 * @async
 */
export declare const queryRoles: {
    (query?: {
        displayName?: Amity.Role['displayName'];
        sortBy?: 'displayName' | 'firstCreated' | 'lastCreated';
        limit?: number;
        queryToken?: string;
    }): Promise<Amity.Cached<Amity.Paged<Amity.Role>> & Amity.Pagination>;
    /**
     * ```js
     * import { queryRoles } from '@amityco/ts-sdk'
     * const roles = queryRoles.locally({ keyword: 'foo' })
     * ```
     *
     * Queries a paginable list of {@link Amity.Role} objects from cache
     * Search is performed by displayName such as `.startsWith(search)`
     *
     * @param query The query parameters
     * @returns A page of {@link Amity.Role} objects
     *
     * @category Role API
     */
    locally(query: Parameters<typeof queryRoles>[0]): void;
};
