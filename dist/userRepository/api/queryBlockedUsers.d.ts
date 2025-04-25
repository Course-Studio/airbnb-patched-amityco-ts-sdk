/**
 * ```js
 * import { UserRepository } from '@amityco/ts-sdk'
 * const { data: users, prevPage, nextPage, total } = await UserRepository.queryBlockedUsers({ page: Amity.PageRaw, limit: number })
 * ```
 *
 * @param query The query parameters
 * @returns A page of {@link Amity.User} objects
 *
 * @category Block API
 * @async
 */
export declare const queryBlockedUsers: {
    (query?: Amity.QueryBlockedUser): Promise<Amity.Cached<Amity.Paged<Amity.User, Amity.PageRaw>> & {
        total: number;
    }>;
    locally(query?: Parameters<typeof queryBlockedUsers>[0]): (Amity.Cached<Amity.Paged<Amity.InternalUser, Amity.PageRaw>> & {
        total: number;
    }) | undefined;
};
