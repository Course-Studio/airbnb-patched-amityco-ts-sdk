/**
 * ```js
 * import { ChannelRepository } from '@amityco/ts-sdk'
 * const isMuted = await ChannelRepository.unmute('foobar')
 * ```
 *
 * Mutes a {@link Amity.Channel} object
 *
 * @param channelId the {@link Amity.Channel} to mute
 * @returns A success boolean if the {@link Amity.Channel} was muted
 *
 * @category Channel API
 * @async
 */
export declare const unmuteChannel: (channelId: Amity.Channel['channelId']) => Promise<boolean>;
