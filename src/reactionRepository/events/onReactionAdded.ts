import { getActiveClient } from '~/client/api';
import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { createEventSubscriber } from '~/core/events';
import { getResolver } from '~/core/model';
import { onPostReactionAdded } from '~/postRepository/events';
import { onCommentReactionAdded } from '~/commentRepository/events';
import { prepareMessagePayload } from '~/messageRepository/utils';

/**
 * ```js
 * import { onReactionAdded } from '@amityco/ts-sdk'
 * const dispose = onReactionAdded('post', postId, post => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.Reaction} has been added
 *
 * @param {@link Amity.ReactableType} referenceType
 * @param {string} referenceId
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Message Events
 * */
export const onReactionAdded = (
  referenceType: Amity.ReactableType,
  referenceId: Amity.Reaction['referenceId'],
  callback: Amity.Listener<Amity.Models[typeof referenceType]>,
): Amity.Unsubscriber => {
  const callbackWrapper = (model: Amity.Models[typeof referenceType]) => {
    if (getResolver(referenceType)(model as any) === referenceId) {
      callback(model);
    }
  };

  /*
   * Important: Want to point out that reference type will never be 'message'
   * for onReactionAdded
   */

  if (referenceType === 'message') {
    const client = getActiveClient();

    const filter = async (rawPayload: Amity.MessagePayload) => {
      const payload = await prepareMessagePayload(rawPayload);
      const cached = pullFromCache<Amity.Message>([
        'message',
        'get',
        payload.messages[0].messageId,
      ]);
      const isReactionEvent = cached?.data?.reactionsCount !== payload.messages[0].reactionsCount;

      ingestInCache(payload);

      if (isReactionEvent) {
        callbackWrapper(payload.messages[0]);
      }
    };

    return createEventSubscriber(client, 'reaction/onReactionAdded', 'message.updated', filter);
  }

  if (referenceType === 'post') {
    return onPostReactionAdded(callbackWrapper);
  }

  return onCommentReactionAdded(callbackWrapper);
};
