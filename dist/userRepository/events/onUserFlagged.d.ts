/**
 * ```js
 * import { onUserFlagged } from '@amityco/ts-sdk'
 * const dispose = onUserFlagged(user => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.InternalUser} has been flagged
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category User Events
 */
export declare const onUserFlagged: (callback: Amity.Listener<Amity.InternalUser>) => Amity.Unsubscriber;
