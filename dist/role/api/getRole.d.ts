/**
 * ```js
 * import { getRole } from '@amityco/ts-sdk'
 * const role = await getRole('foobar')
 * ```
 *
 * Fetches a {@link Amity.Role} object
 *
 * @param roleId the ID of the {@link Amity.Role} to fetch
 * @returns the associated {@link Amity.Role} object
 *
 * @category Role API
 * @async
 */
export declare const getRole: {
    (roleId: Amity.Role["roleId"]): Promise<Amity.Cached<Amity.Role>>;
    locally(roleId: Amity.Role["roleId"]): Amity.Cached<Amity.Role> | undefined;
};
