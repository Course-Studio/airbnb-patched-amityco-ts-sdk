/**
 * ```js
 * import { getDeliveredUsers } from '@amityco/ts-sdk'
 * const { data: users, prevPage, nextPage } = await getDeliveredUsers({
 *   messageId: 'foo',
 * })
 * ```
 *
 * Queries a paginable list of delivered {@link Amity.InternalUser} by messageId
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.InternalUser} objects
 *
 * @category Message API
 * @async
 */
export declare const getDeliveredUsers: {
    (query: Amity.QueryDeliveredUsers): Promise<Amity.Cached<Amity.Paged<Amity.InternalUser>>>;
    locally(query: Amity.QueryDeliveredUsers): Amity.Cached<Amity.Paged<Amity.InternalUser>> | undefined;
};
