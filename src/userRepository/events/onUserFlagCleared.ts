import { createUserEventSubscriber } from './utils';

/**
 * ```js
 * import { onUserFlagCleared } from '@amityco/ts-sdk'
 * const dispose = onUserFlagCleared(user => {
 *   // ...
 * })
 * ```
 *
 * Fired when flags have been cleared for a {@link Amity.InternalUser}
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category User Events
 */
export const onUserFlagCleared = (callback: Amity.Listener<Amity.InternalUser>) =>
  createUserEventSubscriber('user.flagCleared', callback);
