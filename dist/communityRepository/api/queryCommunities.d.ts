/**
 * ```js
 * import { queryCommunities } from '@amityco/ts-sdk'
 * const communities = await queryCommunities()
 * ```
 *
 * Queries a paginable list of {@link Amity.Community} objects
 * Search is performed by displayName such as `.startsWith(search)`
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.Community} objects
 *
 * @category Community API
 * @async
 */
export declare const queryCommunities: (query?: Amity.QueryCommunities) => Promise<Amity.Cached<Amity.PageToken<Amity.Community>>>;
