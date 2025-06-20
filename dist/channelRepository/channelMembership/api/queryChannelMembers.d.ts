/**
 * ```js
 * import { queryChannelMembers } from '@amityco/ts-sdk'
 * const channelMembers = await queryChannelMembers({ channelId: 'foo' })
 * ```
 *
 * Queries a paginable list of {@link Amity.ChannelUser} objects
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.ChannelUser} objects
 *
 * @category Channel API
 * @async
 * */
export declare const queryChannelMembers: {
    (query: Amity.QueryChannelMembers): Promise<Amity.Cached<Amity.Paged<Amity.Membership<"channel">>>>;
    locally(query: Parameters<typeof queryChannelMembers>[0]): Amity.Cached<Amity.Paged<Amity.Membership<"channel">>> | undefined;
};
