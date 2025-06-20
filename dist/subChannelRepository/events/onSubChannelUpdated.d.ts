/**
 * ```js
 * import { onSubChannelUpdated } from '@amityco/ts-sdk'
 * const dispose = onSubChannelUpdated(subChannel => {
 *   // ...
 * })
 * ```
 *
 * Fired when any {@link Amity.SubChannel} have been updated
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Channel Events
 */
export declare const onSubChannelUpdated: (callback: Amity.Listener<Amity.SubChannel>) => () => void;
