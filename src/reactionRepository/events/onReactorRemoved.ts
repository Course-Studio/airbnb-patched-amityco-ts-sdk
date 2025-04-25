import { getActiveClient } from '~/client/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { createEventSubscriber } from '~/core/events';
import { prepareMessagePayload } from '~/messageRepository/utils';

/**
 * ```js
 * import { onReactorRemoved } from '@amityco/ts-sdk'
 * const dispose = onReactorRemoved('post', postId, reactor => {
 *   // ...
 * })
 * ```
 *
 * Fired when an {@link Amity.InternalReactor} has been removed
 *
 * @param {@link Amity.ReactableType} referenceType
 * @param {string} referenceId
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Events
 * */
export const onReactorRemoved = (
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

      callbackWrapper('message', payload.messages[0].messageId, payload.reactions[0]);
    };

    return createEventSubscriber(
      client,
      'reaction/onReactorRemoved',
      'message.reactionRemoved',
      filter,
    );
  }

  if (referenceType === 'post') {
    const filter = (payload: Amity.PostPayload & { reactor: Amity.InternalReactor }) => {
      const { reactor, ...rest } = payload;

      ingestInCache(rest as Amity.ProcessedPostPayload);
      // FIXME: correct reactions type in model
      // @ts-ignore
      ingestInCache({ reactions: [reactor] });

      callbackWrapper('post', payload.posts[0].postId, reactor);
    };

    return createEventSubscriber(client, 'post.removeReaction', 'post.removeReaction', filter);
  }

  if (referenceType === 'story') {
    const filter = (payload: Amity.StoryReactionPayload) => {
      const { reactions, ...rest } = payload;
      ingestInCache(rest as Amity.StoryPayload);
      ingestInCache({ reactors: reactions });

      if (payload.stories.length === 0 || payload.reactions.length === 0) return;
      callbackWrapper('story', payload.stories[0].storyId, payload.reactions[0]);
    };

    return createEventSubscriber(client, 'story.reactionRemoved', 'story.reactionRemoved', filter);
  }

  const filter = (payload: Amity.CommentPayload & { reactor: Amity.InternalReactor }) => {
    const { reactor, ...rest } = payload;

    ingestInCache(rest as Amity.CommentPayload);
    // FIXME: correct reactions type in model
    // @ts-ignore
    ingestInCache({ reactions: [reactor] });

    callbackWrapper('comment', payload.comments[0].commentId, reactor);
  };

  return createEventSubscriber(client, 'comment.removeReaction', 'comment.removeReaction', filter);
};
