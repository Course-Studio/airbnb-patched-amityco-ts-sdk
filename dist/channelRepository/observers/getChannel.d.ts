/**
 * ```js
 * import { getChannel } from '@amityco/ts-sdk';
 *
 * let channel;
 *
 * const unsubscribe = getChannel(channelId, response => {
 *   channel = response.data;
 * });
 * ```
 *
 * Observe all mutation on a given {@link Amity.Channel}
 *
 * @param channelId the ID of the channel to observe
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the channel
 *
 * @category Message Live Object
 */
export declare const getChannel: (channelId: Amity.Channel["channelId"], callback: Amity.LiveObjectCallback<Amity.Channel>) => Amity.Unsubscriber;
