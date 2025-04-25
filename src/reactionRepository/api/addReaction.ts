import { getActiveClient } from '~/client/api';

import { upsertInCache, pullFromCache, pushToCache } from '~/cache/api';

import { UNSYNCED_OBJECT_CACHED_AT_VALUE } from '~/utils/constants';
import { dispatchReactable } from '../utils';
import { fireEvent } from '~/core/events';
import { ASCApiError } from '~/core/errors';

/* begin_public_function
  id: reaction.add
*/
/**
 * ```js
 * import { addReaction } from '@amityco/ts-sdk'
 * const success = await addReaction('post', postId, 'like')
 * ```
 *
 * Creates an {@link Amity.Reaction}
 *
 * @param referenceType The type of thing to add a {@link Amity.Reaction} to, such as a post or a comment.
 * @param referenceId The ID of the thing to add a new {@link Amity.Reaction} to.
 * @param reactionName Reaction name, such as a `like` or `love`.
 * @returns The added result.
 *
 * @category Reaction API
 * @async
 * */
export const addReaction = async (
  referenceType: Amity.Reaction['referenceType'],
  referenceId: Amity.Reaction['referenceId'],
  reactionName: Amity.InternalReactor['reactionName'],
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('reaction/createReaction', {
    referenceId,
    referenceType,
    reactionName,
  });

  if (!['post', 'comment', 'story', 'message'].includes(referenceType))
    throw new ASCApiError(
      'The reference type is not valid. It should be one of post, comment, story, or message',
      Amity.ServerError.BAD_REQUEST,
      Amity.ErrorLevel.ERROR,
    );

  const { data } = await client.http.post<{ addedId: 'string' }>('/api/v2/reactions', {
    referenceId,
    referenceType,
    reactionName,
    referenceVersion: referenceType === 'message' ? 5 : undefined,
  });

  if (client.cache) {
    const model = pullFromCache<Amity.Models[Amity.ReactableType]>([
      referenceType,
      'get',
      referenceId,
    ]);

    if (!model) return true;

    const updatedModel = {
      ...model.data,
      reactionsCount: model.data.reactionsCount + 1,
      myReactions: [...(model.data.myReactions ?? []), reactionName],
      reactions: {
        ...model.data.reactions,
        [reactionName]: (model.data.reactions[reactionName] ?? 0) + 1,
      },
    } as Amity.Models[Amity.ReactableType];

    if (referenceType === 'comment') {
      fireEvent('local.comment.addReaction', {
        comment: updatedModel as Amity.InternalComment,
        reactor: {
          userId: client.userId!,
          reactionName,
          reactionId: data.addedId,
        },
      });

      return true;
    }
    if (referenceType === 'post') {
      fireEvent('local.post.addReaction', {
        post: updatedModel as Amity.InternalPost,
        reactor: {
          userId: client.userId!,
          reactionName,
          reactionId: data.addedId,
        },
      });

      return true;
    }
    if (referenceType === 'story') {
      fireEvent('local.story.reactionAdded', {
        story: updatedModel as Amity.InternalStory,
        reactor: {
          userId: client.userId!,
          reactionName,
          reactionId: data.addedId,
        },
      });

      return true;
    }
  }

  return true;
};
/* end_public_function */

/**
 * ```js
 * import { addReaction } from '@amityco/ts-sdk'
 * const success = addReaction.optimistically('post', postId, 'like')
 * ```
 *
 * Creates an {@link Amity.Reaction} optimistically
 *
 * @param referenceType The type of thing to add a {@link Amity.Reaction} to, such as a post or a comment.
 * @param referenceId The ID of the thing to add a new {@link Amity.Reaction} to.
 * @param reactionName Reaction name, such as a `like` or `love`.
 * @returns The added result.
 *
 * @category Reaction API
 * */
addReaction.optimistically = (
  referenceType: Amity.ReactableType,
  referenceId: Amity.Reaction['referenceId'],
  reactionName: Amity.InternalReactor['reactionName'],
): boolean | undefined => {
  const client = getActiveClient();
  client.log('reaction/createReaction.optimistically', {
    referenceId,
    referenceType,
    reactionName,
  });

  if (!client.cache) return;

  const model = pullFromCache<Amity.Models[Amity.ReactableType]>([
    referenceType,
    'get',
    referenceId,
  ]);

  if (!model?.data || model.data.myReactions?.includes(reactionName)) return;

  const reaction = {
    ...model.data,
    reactionsCount: model.data.reactionsCount + 1,
    myReactions: [...(model.data.myReactions ?? []), reactionName],
    reactions: {
      ...model.data.reactions,
      [reactionName]: (model.data.reactions[reactionName] ?? 0) + 1,
    },
  } as Amity.Models[Amity.ReactableType];

  upsertInCache([referenceType, 'get', referenceId], reaction, {
    cachedAt: UNSYNCED_OBJECT_CACHED_AT_VALUE,
  });

  dispatchReactable(referenceType, reaction);

  return reaction?.myReactions?.includes(reactionName) ?? false;
};
