/**
 * ```js
 * import { updateChannel } from '@amityco/ts-sdk'
 * const updated = await updateChannel(channelId, { displayName: 'foobar' })
 * ```
 *
 * Updates an {@link Amity.Channel}
 *
 * @param channelId The ID of the {@link Amity.Channel} to edit
 * @param patch The patch data to apply
 * @returns the updated {@link Amity.Channel} object
 *
 * @category Channel API
 * @async
 */
export declare const updateChannel: (channelId: Amity.Channel["channelId"], patch: Patch<Amity.Channel, "displayName" | "avatarFileId" | "tags" | "metadata">) => Promise<Amity.Cached<Amity.InternalChannel>>;
