/**
 * ```js
 * import { getSubChannel } from '@amityco/ts-sdk';
 *
 * let subChannel;
 *
 * const unsubscribe = getSubChannel(subChannelId, response => {
 *   subChannel = response.data;
 * });
 * ```
 *
 * Observe all mutation on a given {@link Amity.SubChannel}
 *
 * @param subChannelId the ID of the message to observe
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the sub channel
 *
 * @category SubChannel Live Object
 */
export declare const getSubChannel: (subChannelId: Amity.SubChannel["subChannelId"], callback: Amity.LiveObjectCallback<Amity.SubChannel>) => Amity.Unsubscriber;
