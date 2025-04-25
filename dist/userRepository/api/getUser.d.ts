/**
 * ```js
 * import { getUser } from '~/user/api'
 * const { data: user } = await getUser('foobar')
 * ```
 *
 * Fetches a {@link Amity.User} object
 *
 * @param userId the ID of the {@link Amity.User} to fetch
 * @returns the associated {@link Amity.User} object
 *
 * @category Private
 * @async
 */
export declare const getUser: {
    (userId: Amity.User["userId"]): Promise<Amity.Cached<Amity.User>>;
    locally(userId: Amity.User["userId"]): Amity.Cached<Amity.User> | undefined;
};
