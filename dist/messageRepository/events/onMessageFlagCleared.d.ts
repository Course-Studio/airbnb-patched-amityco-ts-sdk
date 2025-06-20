/**
 * ```js
 * import { onMessageFlagCleared } from '@amityco/ts-sdk'
 * const dispose = onMessageFlagCleared(message => {
 *   // ...
 * })
 * ```
 *
 * Fired when flags have been cleared for a {@link Amity.Message}
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Message Events
 */
export declare const onMessageFlagCleared: (callback: Amity.Listener<Amity.InternalMessage>) => Amity.Unsubscriber;
