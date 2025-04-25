/**
 * ```js
 * import { ChannelRepository } from '@amityco/ts-sdk'
 * const isMuted = await ChannelRepository.muteChannel('channel-id', 100)
 * ```
 *
 * Mutes a {@link Amity.Channel} object
 *
 * @param channelId the {@link Amity.Channel} to mute
 * @param mutePeriod the duration to be muted
 * @returns A success boolean if the {@link Amity.Channel} was muted
 *
 * @category Channel API
 * @async
 */
export declare const muteChannel: (channelId: Amity.Channel['channelId'], mutePeriod?: number) => Promise<boolean>;
//# sourceMappingURL=muteChannel.d.ts.map