/**
 * ```js
 * import { queryChannels } from '@amityco/ts-sdk'
 * const channels = await queryChannels()
 * ```
 *
 * Queries a paginable list of {@link Amity.Channel} objects
 * Search is performed by displayName such as `.startsWith(search)`
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.Channel} objects
 *
 * @category Channel API
 * @async
 */
export declare const queryChannels: (query?: Amity.QueryChannels) => Promise<Amity.Cached<Amity.PageToken<Amity.InternalChannel>>>;
