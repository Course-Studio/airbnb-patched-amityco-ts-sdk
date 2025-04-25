/**
 * ```js
 * import { removeRole } from '@amityco/ts-sdk'
 * const updated = await removeRole(channelId, 'foo', ['bar'])
 * ```
 *
 * Removes an {@link Amity.Role} from a list of {@link Amity.InternalUser} on a {@link Amity.Channel}
 *
 * @param channelId The ID of the {@link Amity.Channel} to perform
 * @param roleId The ID of the {@link Amity.Role} to apply
 * @param userIds Array of IDs of the {@link Amity.InternalUser} to perform
 * @returns A success boolean if the {@link Amity.Role} were removed from list of {@link Amity.InternalUser} in the {@link Amity.Channel}
 *
 * @category Channel API
 * @async
 */
export declare const removeRole: (channelId: Amity.Channel['channelId'], roleId: Amity.Role['roleId'], userIds: Amity.InternalUser['userId'][]) => Promise<boolean>;
//# sourceMappingURL=removeRole.d.ts.map