/**
 * ```js
 * import { addMembers } from '@amityco/ts-sdk'
 * const updated = await addMembers(channelId, ['foo', 'bar'])
 * ```
 *
 * Adds a list of {@link Amity.InternalUser} to a {@link Amity.Channel}
 *
 * @param channelId The ID of the {@link Amity.Channel} to perform
 * @param userIds The list of IDs {@link Amity.InternalUser} to add
 * @returns A success boolean if the {@link Amity.InternalUser} were added to the {@link Amity.Channel}
 *
 * @category Channel API
 * @async
 */
export declare const addMembers: (channelId: Amity.Channel["channelId"], userIds: Amity.InternalUser["userId"][]) => Promise<boolean>;
