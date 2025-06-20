/**
 * ```js
 * import { onMessageReactionAdded } from '@amityco/ts-sdk';
 *
 * const unsubscribe = onMessageReactionAdded(message => {
 *   // ...
 * });
 * ```
 *
 * Fired when a {@link Amity.Message} has been reacted
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Post Events
 */
export declare const onMessageReactionAdded: (callback: Amity.Listener<Amity.InternalMessage>) => Amity.Unsubscriber;
