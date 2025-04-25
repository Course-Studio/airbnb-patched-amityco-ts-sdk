import { onMessageMarked, onMessageMarkerFetched } from '~/marker/events';
import { convertEventPayload } from '~/utils/event';
import { liveObject } from '~/utils/liveObject';
import { getMessage as _getMessage } from '../internalApi/getMessage';
import {
  onMessageUpdated,
  onMessageDeleted,
  onMessageFlagged,
  onMessageUnflagged,
  onMessageFlagCleared,
  onMessageReactionAdded,
  onMessageReactionRemoved,
} from '../events';
import { onMessageFetched } from '../events/onMessageFetched';
import { LinkedObject } from '~/utils/linkedObject';

/* begin_public_function
  id: message.get
*/
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
export const getMessage = (
  messageId: Amity.Message['messageId'],
  callback: Amity.LiveObjectCallback<Amity.Message>,
): Amity.Unsubscriber => {
  const responder: Amity.LiveObjectCallback<Amity.InternalMessage> = (
    snapshot: Amity.LiveObject<Amity.InternalMessage>,
  ) => {
    const { data } = snapshot;
    callback({ ...snapshot, data: data ? LinkedObject.message(snapshot.data) : data });
  };
  return liveObject(messageId, responder, 'messageId', _getMessage, [
    onMessageFetched,
    onMessageUpdated,
    onMessageDeleted,
    onMessageFlagged,
    onMessageUnflagged,
    onMessageFlagCleared,
    onMessageReactionAdded,
    onMessageReactionRemoved,
    convertEventPayload(onMessageMarkerFetched, 'contentId', 'message'),
    convertEventPayload(onMessageMarked, 'contentId', 'message'),
  ]);
};
/* end_public_function */
