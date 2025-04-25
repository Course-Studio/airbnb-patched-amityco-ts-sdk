/**
 * ```js
 * import { removeMembers } from '@amityco/ts-sdk'
 * const updated = await removeMembers(channelId, ['foo', 'bar'])
 * ```
 *
 * Removes a list of {@link Amity.InternalUser} from a {@link Amity.Channel}
 *
 * @param channelId The ID of the {@link Amity.Channel} to perform
 * @param userIds The list of IDs {@link Amity.InternalUser} to remove
 * @returns A success boolean if the list of {@link Amity.InternalUser} were removed from the {@link Amity.Channel}
 *
 * @category Channel API
 * @async
 */
export declare const removeMembers: (channelId: Amity.Channel["channelId"], userIds: Amity.InternalUser["userId"][]) => Promise<boolean>;
