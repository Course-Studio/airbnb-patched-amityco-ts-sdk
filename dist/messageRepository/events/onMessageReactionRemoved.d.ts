/**
 * ```js
 * import { onMessageReactionRemoved } from '@amityco/ts-sdk';
 *
 * const unsubscribe = onMessageReactionRemoved(message => {
 *   // ...
 * });
 * ```
 *
 * Fired when a reaction has been removed from a {@link Amity.Message}
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Post Events
 */
export declare const onMessageReactionRemoved: (callback: Amity.Listener<Amity.InternalMessage>) => Amity.Unsubscriber;
