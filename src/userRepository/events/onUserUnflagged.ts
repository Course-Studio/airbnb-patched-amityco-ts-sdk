import { createUserEventSubscriber } from './utils';

/**
 * ```js
 * import { onUserUnflagged } from '@amityco/ts-sdk'
 * const dispose = onUserUnflagged(user => {
 *   // ...
 * })
 * ```
 *
 * Fired when a flag has been removed from a {@link Amity.InternalUser}
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category User Events
 */
export const onUserUnflagged = (callback: Amity.Listener<Amity.InternalUser>) =>
  createUserEventSubscriber('user.unflagged', callback);
