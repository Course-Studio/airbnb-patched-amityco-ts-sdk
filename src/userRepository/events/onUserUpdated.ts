import { createUserEventSubscriber } from './utils';

/**
 * ```js
 * import { onUserUpdated } from '@amityco/ts-sdk'
 * const dispose = onUserUpdated(user => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.InternalUser} has been updated
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category User Events
 */
export const onUserUpdated = (callback: Amity.Listener<Amity.InternalUser>) =>
  createUserEventSubscriber('user.updated', callback);
