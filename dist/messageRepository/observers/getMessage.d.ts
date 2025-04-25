/**
 * ```js
 * import { getMessage } from '@amityco/ts-sdk';
 *
 * let message;
 *
 * const unsubscribe = getMessage(messageId, response => {
 *   message = response.data;
 * });
 * ```
 *
 * Observe all mutation on a given {@link Amity.Message}
 *
 * @param messageId the ID of the message to observe
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the message
 *
 * @category Message Live Object
 */
export declare const getMessage: (messageId: Amity.Message['messageId'], callback: Amity.LiveObjectCallback<Amity.Message>) => Amity.Unsubscriber;
//# sourceMappingURL=getMessage.d.ts.map