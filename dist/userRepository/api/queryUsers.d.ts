/**
 * ```js
 * import { queryUsers } from '@amityco/ts-sdk'
 * const { data: users, prevPage, nextPage } = await queryUsers({ displayName: 'foo' })
 * ```
 *
 * Queries a paginable list of {@link Amity.User} objects
 * Search is performed by displayName such as `.startsWith(search)`
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.User} objects
 *
 * @category User API
 * @async
 */
export declare const queryUsers: {
    (query?: Amity.QueryUsers): Promise<Amity.Cached<Amity.PageToken<Amity.User>>>;
    locally(query?: Parameters<typeof queryUsers>[0]): Amity.Cached<Amity.PageToken<Amity.User>> | undefined;
};
