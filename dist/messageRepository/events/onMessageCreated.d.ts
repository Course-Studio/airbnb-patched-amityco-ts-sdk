/**
 * ```js
 * import { onMessageCreated } from '@amityco/ts-sdk'
 * const dispose = onMessageCreated(message => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.Message} has been created
 *
 * @param callback The function to call when the event was fired
 * @param local Trigger when an event occurs from a local event or not
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Message Events
 */
export declare const onMessageCreatedMqtt: (callback: Amity.Listener<Amity.InternalMessage>) => Amity.Unsubscriber;
export declare const onMessageCreatedLocal: (callback: Amity.Listener<Amity.InternalMessage>) => Amity.Unsubscriber;
//# sourceMappingURL=onMessageCreated.d.ts.map