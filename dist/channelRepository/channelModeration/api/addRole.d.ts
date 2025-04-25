/**
 * ```js
 * import { addRole } from '@amityco/ts-sdk'
 * const updated = await addRole(channelId, 'foo', ['bar'])
 * ```
 *
 * Adds an {@link Amity.Role} to a list of {@link Amity.InternalUser} on a {@link Amity.Channel}
 *
 * @param channelId The ID of the {@link Amity.Channel} to perform
 * @param roleId The ID of the {@link Amity.Role} to apply
 * @param userId Array of IDs of the {@link Amity.InternalUser} to perform
 * @returns A success boolean if the {@link Amity.Role} were added to list of {@link Amity.InternalUser} in the {@link Amity.Channel}
 *
 * @category Channel API
 * @async
 */
export declare const addRole: (channelId: Amity.Channel['channelId'], roleId: Amity.Role['roleId'], userIds: Amity.InternalUser['userId'][]) => Promise<boolean>;
//# sourceMappingURL=addRole.d.ts.map