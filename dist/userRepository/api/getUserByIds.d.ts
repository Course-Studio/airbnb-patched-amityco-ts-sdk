/**
 * ```js
 * import { getUsers } from '@amityco/ts-sdk'
 * const { data: users } = await getUsers(['foo', 'bar'])
 * ```
 *
 * Fetches a collection of {@link Amity.User} objects
 *
 * @param userIds the IDs of the {@link Amity.User} to fetch
 * @returns the associated collection of {@link Amity.User} objects
 *
 * @category User API
 * @async
 */
export declare const getUserByIds: {
    (userIds: Amity.User["userId"][]): Promise<Amity.Cached<Amity.User[]>>;
    locally(userIds: Amity.User["userId"][]): Amity.Cached<Amity.User[]> | undefined;
};
