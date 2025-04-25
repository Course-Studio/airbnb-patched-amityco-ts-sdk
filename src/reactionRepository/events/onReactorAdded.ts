import { getActiveClient } from '~/client/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { createEventSubscriber } from '~/core/events';
import { prepareMessagePayload } from '~/messageRepository/utils';

/**
 * ```js
 * import { onReactorAdded } from '@amityco/ts-sdk'
 * const dispose = onReactorAdded('post', postId, reactor => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.InternalReactor} has been added
 *
 * @param {@link Amity.ReactableType} referenceType
 * @param {string} referenceId
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Events
 * */
export const onReactorAdded = (
  referenceType: Amity.ReactableType,
  referenceId: Amity.Reaction['referenceId'],
  callback: Amity.Listener<Amity.InternalReactor>,
): Amity.Unsubscriber => {
  const client = getActiveClient();

  const callbackWrapper = (
    referenceType_: Amity.ReactableType,
    referenceId_: Amity.Reaction['referenceId'],
    reaction: Amity.InternalReactor,
  ) => {
    if (referenceType_ === referenceType && referenceId_ === referenceId) {
      callback(reaction);
    }
  };

  if (referenceType === 'message') {
    const filter = async (rawPayload: Amity.MessagePayload) => {
      const payload = await prepareMessagePayload(rawPayload);
      if (!payload.reactions[0]) return;

      ingestInCache(payload);
      ingestInCache({ reactors: payload.reactions });

      callbackWrapper('message', payload.messages[0].messageId, payload.reactions[0]);
    };

    return createEventSubscriber(
      client,
      'reaction/onReactorAdded',
      'message.reactionAdded',
      filter,
    );
  }

  if (referenceType === 'post') {
    const filter = (payload: Amity.PostPayload & { reactor: Amity.InternalReactor }) => {
      const { reactor, ...rest } = payload;

      ingestInCache(rest as Amity.ProcessedPostPayload);
      ingestInCache({ reactions: [reactor] });

      callbackWrapper('post', payload.posts[0].postId, reactor);
    };

    return createEventSubscriber(client, 'post.addReaction', 'post.addReaction', filter);
  }

  if (referenceType === 'story') {
    const filter = (payload: Amity.StoryReactionPayload) => {
      const { reactions, ...rest } = payload;
      ingestInCache(rest as Amity.StoryPayload);
      ingestInCache({ reactors: reactions });

      if (payload.stories.length === 0 || payload.reactions.length === 0) return;
      callbackWrapper('story', payload.stories[0].storyId, payload.reactions[0]);
    };

    return createEventSubscriber(client, 'story.reactionAdded', 'story.reactionAdded', filter);
  }

  const filter = (payload: Amity.CommentPayload & { reactor: Amity.InternalReactor }) => {
    const { reactor, ...rest } = payload;

    ingestInCache(rest as Amity.CommentPayload);
    ingestInCache({ reactions: [reactor] });

    callbackWrapper('comment', payload.comments[0].commentId, reactor);
  };

  return createEventSubscriber(client, 'comment.addReaction', 'comment.addReaction', filter);
};
