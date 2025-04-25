/**
 * ```js
 * import { MessageRepository } from '@amityco/ts-sdk'
 * const { data: users, prevPage, nextPage } = await MessageRepository.getReadUsers({
 *   messageId: 'foo',
 *   memberships: ['member']
 * })
 * ```
 *
 * Queries a paginable list of read {@link Amity.InternalUser} by messageId
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.InternalUser} objects
 *
 * @category Message API
 * @async
 */
export declare const getReadUsers: {
    (query: Amity.QueryReadUsers): Promise<Amity.Cached<Amity.Paged<Amity.InternalUser>>>;
    /**
     * ```js
     * import { getReadUsers } from '@amityco/ts-sdk'
     * const { data: users } = getReadUsers.locally({
     *   messageId: 'foo',
     *   memberships: ['member']
     * })
     * ```
     *
     * Queries a paginable list of read {@link Amity.InternalUser} objects from cache
     *
     * @param query The query parameters
     * @returns A page of {@link Amity.InternalUser} objects
     *
     * @category Message API
     */
    locally(query: Amity.QueryReadUsers): Amity.Cached<Amity.Paged<Amity.InternalUser>> | undefined;
};
//# sourceMappingURL=getReadUsers.d.ts.map