import { liveObject } from '~/utils/liveObject';
import { getPoll as _getPoll } from '../api/getPoll';
import { onPollDeleted, onPollUpdated } from '../events';

/* begin_public_function
  id: poll.get
*/
/**
 * ```js
 * import { PollRepository } from '@amityco/ts-sdk';
 *
 * let poll;
 *
 * const unsub = PollRepository.getPoll(commentId, response => {
 *   poll = response.data;
 * });
 * ```
 *
 * Observe all mutation on a given {@link Amity.Poll}
 *
 * @param pollId the ID of the poll to observe
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the poll
 *
 * @category Poll Live Object
 */
export const getPoll = (
  pollId: Amity.Poll['pollId'],
  callback: Amity.LiveObjectCallback<Amity.Poll>,
): Amity.Unsubscriber => {
  return liveObject(pollId, callback, 'pollId', _getPoll, [onPollUpdated, onPollDeleted]);
};
/* end_public_function */
