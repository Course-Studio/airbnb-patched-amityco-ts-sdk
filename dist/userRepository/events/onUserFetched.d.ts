/**
 * ```js
 * import { onUserFetched } from '@amityco/ts-sdk'
 * const dispose = onUserFetched(user => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.InternalUser} has been fetched
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category User Events
 */
export declare const onUserFetched: (callback: Amity.Listener<Amity.InternalUser>) => Amity.Unsubscriber;
