import { getActiveClient } from '~/client/api';

import { upsertInCache, pullFromCache, pushToCache } from '~/cache/api';

import { UNSYNCED_OBJECT_CACHED_AT_VALUE } from '~/utils/constants';

import { dispatchReactable } from '../utils';
import { fireEvent } from '~/core/events';
import { ASCApiError } from '~/core/errors';

/* begin_public_function
  id: reaction.remove
*/
/**
 * ```js
 * import { deleteReaction } from '@amityco/ts-sdk'
 * const success = await deleteReaction('post', 'foobar', 'like')
 * ```
 *
 * Removes a {@link Amity.Reaction} from a {@link Amity.Reactable} object
 *
 * @param referenceType The type of thing to add a {@link Amity.Reaction} to, such as a post or a comment.
 * @param referenceId The ID of the thing to add a new {@link Amity.Reaction} to.
 * @param reactionName Reaction name, such as a `like` or `love`.
 * @returns The removed result.
 *
 * @category Reaction API
 * @async
 * */
export const removeReaction = async (
  referenceType: Amity.Reaction['referenceType'],
  referenceId: Amity.Reaction['referenceId'],
  reactionName: Amity.InternalReactor['reactionName'],
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('reaction/removeReaction', {
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

  const { data } = await client.http.delete<{ removedId: string }>(`/api/v2/reactions`, {
    data: {
      referenceId,
      referenceType,
      reactionName,
      referenceVersion: referenceType === 'message' ? 5 : undefined,
    },
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
      reactionsCount: Math.max(0, model.data.reactionsCount - 1),
      myReactions: (model.data.myReactions ?? []).filter(item => item !== reactionName),
      reactions: {
        ...model.data.reactions,
        [reactionName]: Math.max(0, (model.data.reactions[reactionName] ?? 0) - 1),
      },
    } as Amity.Models[Amity.ReactableType];

    if (referenceType === 'comment') {
      fireEvent('local.comment.removeReaction', {
        comment: updatedModel as Amity.InternalComment,
        reactor: {
          reactionId: data.removedId,
          reactionName,
          userId: client.userId!,
        },
      });

      return true;
    }
    if (referenceType === 'post') {
      fireEvent('local.post.removeReaction', {
        post: updatedModel as Amity.InternalPost,
        reactor: {
          reactionId: data.removedId,
          reactionName,
          userId: client.userId!,
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
          reactionId: data.removedId,
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
 * import { removeReaction } from '@amityco/ts-sdk'
 * const success = removeReaction.optimistically('post', postId, 'like')
 * ```
 *
 * Removes a {@link Amity.Reaction} from a {@link Amity.Reactable} object optimistically
 *
 * @param referenceType The type of thing to add a {@link Amity.Reaction} to, such as a post or a comment.
 * @param referenceId The ID of the thing to add a new {@link Amity.Reaction} to.
 * @param reactionName Reaction name, such as a `like` or `love`.
 * @returns The added result.
 *
 * @category Reaction API
 * */
removeReaction.optimistically = (
  referenceType: Amity.ReactableType,
  referenceId: Amity.Reaction['referenceId'],
  reactionName: Amity.InternalReactor['reactionName'],
): boolean | undefined => {
  const client = getActiveClient();
  client.log('reaction/removeReaction.optimistically', {
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

  if (!model?.data || !model.data.myReactions?.includes(reactionName)) return;

  const reaction = {
    ...model.data,
    reactionsCount: Math.max(0, model.data.reactionsCount - 1),
    myReactions: (model.data.myReactions ?? []).filter(item => item !== reactionName),
    reactions: {
      ...model.data.reactions,
      [reactionName]: Math.max(0, (model.data.reactions[reactionName] ?? 0) - 1),
    },
  } as Amity.Models[Amity.ReactableType];

  upsertInCache([referenceType, 'get', referenceId], reaction, {
    cachedAt: UNSYNCED_OBJECT_CACHED_AT_VALUE,
  });

  dispatchReactable(referenceType, reaction);

  return !reaction?.myReactions?.includes(reactionName);
};
