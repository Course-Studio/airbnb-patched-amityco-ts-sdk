/**
 * ```js
 * import { ChannelRepository } from '@amityco/ts-sdk'
 * const success = await ChannelRepository.markAsRead('channelId')
 * ```
 * Updating all {@link Amity.SubChannel} in specify {@link Amity.Channel} as read
 *
 * @param channelId the ID of to specify {@link Amity.Channel}
 * @returns A success boolean if the {@link Amity.Channel} was mark read
 *
 * @category Channel API
 * @async
 */
export declare const markAsRead: (channelId: Amity.Channel['channelInternalId']) => Promise<boolean>;
//# sourceMappingURL=markAsRead.d.ts.map