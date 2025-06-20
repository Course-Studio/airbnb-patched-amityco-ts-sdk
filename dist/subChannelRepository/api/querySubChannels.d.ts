/**
 * ```js
 * import { querySubChannels } from '@amityco/ts-sdk'
 * const subChannels = await querySubChannels({ channelId: 'channelId' })
 * ```
 *
 * Queries a paginable list of {@link Amity.SubChannel} objects
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.SubChannel} objects
 *
 * @category Channel API
 * @async
 */
export declare const querySubChannels: {
    (query: Amity.QuerySubChannels): Promise<Amity.Cached<Amity.Paged<Amity.SubChannel>> & Amity.Pagination>;
    locally(query: Parameters<typeof querySubChannels>[0]): Amity.Cached<Amity.Paged<Amity.SubChannel> & Amity.Pagination> | undefined;
};
