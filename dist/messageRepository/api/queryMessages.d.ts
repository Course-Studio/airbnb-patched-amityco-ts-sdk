/**
 * ```js
 * import { queryMessages } from '@amityco/ts-sdk'
 * const messages = await queryMessages({ channelId })
 * ```
 *
 * Queries a paginable list of {@link Amity.Message} objects
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.Message} objects
 *
 * @category Message API
 * @async
 */
export declare const queryMessages: (query: Amity.QueryMessages) => Promise<Amity.Cached<Amity.Paged<Amity.Message, Amity.Page<string>> & Amity.Pagination>>;
