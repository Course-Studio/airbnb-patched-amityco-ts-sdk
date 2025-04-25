import { getActiveClient } from '~/client/api';
import { createEventSubscriber, fireEvent } from '~/core/events';
import { pullFromCache, pushToCache, queryCache, upsertInCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { LinkedObject } from '~/utils/linkedObject';
import { prepareCommentFromFlaggedEvent } from '~/reactionRepository/utils/prepareReactionPayloadFromEvent';

export const createCommentEventSubscriber = (
  event: keyof Amity.MqttCommentEvents,
  callback: Amity.Listener<Amity.InternalComment>,
) => {
  const client = getActiveClient();

  const filter = (payload: Amity.CommentPayload) => {
    if (!client.cache) {
      // TODO: here we are missing specific properties here!
      callback(LinkedObject.comment(payload.comments[0]));
    } else {
      const processed = ['comment.flagged', 'comment.unflagged'].includes(event)
        ? prepareCommentFromFlaggedEvent(payload)
        : payload;
      // NOTE: The event data should be merge with existing cache rather than replace it
      ingestInCache(processed, undefined, false);

      const { comments } = processed;

      if (comments.length > 0) {
        const comment = pullFromCache<Amity.InternalComment>([
          'comment',
          'get',
          comments[0].commentId,
        ])!;

        if (['comment.created'].includes(event)) {
          // NOTE: skip adding comment to parent comment children if it's the same user since we use the local event to update instead.
          if (event === 'comment.created' && comment.data.userId === client.userId) return;

          if (comments[0].parentId) {
            const parentComment = pullFromCache<Amity.InternalComment>([
              'comment',
              'get',
              comments[0].parentId,
            ]);

            if (parentComment?.data) {
              // Skip to update parent childComment if current comment already exists
              if (!parentComment.data.children.includes(comments[0].commentId)) {
                pushToCache(['comment', 'get', comments[0].parentId], {
                  ...parentComment.data,
                  childrenNumber: parentComment.data.childrenNumber + 1,
                  children: [...new Set([...parentComment.data.children, comments[0].commentId])],
                });
              }
            }
          }
        }

        if (['comment.deleted'].includes(event)) {
          // NOTE: skip deleting comment to parent comment children if it's the same user since we use the local event to update instead.
          if (event === 'comment.deleted' && comment.data.userId === client.userId) return;

          if (comments[0].parentId) {
            const parentComment = pullFromCache<Amity.InternalComment>([
              'comment',
              'get',
              comments[0].parentId,
            ]);

            if (parentComment?.data) {
              // Remove deleted comment in parent childComment if still exists
              if (parentComment.data.children.includes(comments[0].commentId)) {
                const newParentComment = {
                  ...parentComment.data,
                  childrenNumber: parentComment.data.childrenNumber - 1,
                  children: [
                    ...new Set([
                      ...parentComment.data.children.filter(id => id !== comments[0].commentId),
                    ]),
                  ],
                };

                pushToCache(['comment', 'get', comments[0].parentId], newParentComment);
              }
            }
          }

          const queries = queryCache<Amity.InternalComment[]>(['comment', 'query'])?.filter(
            ({ key }) => (key[2] as Amity.QueryComments)?.referenceId === comment.data.referenceId,
          );

          queries?.map(({ key, data }) => upsertInCache(key, data as any, { cachedAt: -1 }));
        }

        callback(LinkedObject.comment(comment.data));
      }
    }
  };

  return createEventSubscriber(client, event, event, filter);
};

export const createLocalCommentEventSubscriber = (
  event: keyof Omit<
    Amity.LocalCommentEvents,
    'local.comment.addReaction' | 'local.comment.removeReaction'
  >,
  callback: Amity.Listener<Amity.InternalComment>,
) => {
  const client = getActiveClient();

  const filter = (payload: Amity.CommentPayload) => {
    if (!client.cache) {
      // TODO: here we are missing specific properties here!
      callback(LinkedObject.comment(payload.comments[0]));
    } else {
      const processed = payload;

      ingestInCache(processed);

      const { comments } = processed;

      if (comments.length > 0) {
        const comment = pullFromCache<Amity.InternalComment>([
          'comment',
          'get',
          comments[0].commentId,
        ])!;

        if (['local.comment.created'].includes(event)) {
          if (comments[0].parentId) {
            const parentComment = pullFromCache<Amity.InternalComment>([
              'comment',
              'get',
              comments[0].parentId,
            ]);

            if (parentComment?.data) {
              // Skip to update parent childComment if current comment already exists
              if (!parentComment.data.children.includes(comments[0].commentId)) {
                const newParentComment = {
                  ...parentComment.data,
                  childrenNumber: parentComment.data.childrenNumber + 1,
                  children: [...new Set([...parentComment.data.children, comments[0].commentId])],
                };
                pushToCache(['comment', 'get', comments[0].parentId], newParentComment);

                setTimeout(() => {
                  // NOTE: This is workaround solution for emitting event not work properly.
                  fireEvent('comment.updated', {
                    comments: [newParentComment],
                    commentChildren: [],
                    files: [],
                    users: [],
                    communityUsers: [],
                  });
                }, 200);
              }
            }
          }

          const queries = queryCache<Amity.InternalComment[]>(['comment', 'query'])?.filter(
            ({ key }) => (key[2] as Amity.QueryComments)?.referenceId === comment.data.referenceId,
          );

          queries?.map(({ key, data }) => upsertInCache(key, data as any, { cachedAt: -1 }));
        }

        if (['local.comment.deleted'].includes(event)) {
          if (comments[0].parentId) {
            const parentComment = pullFromCache<Amity.InternalComment>([
              'comment',
              'get',
              comments[0].parentId,
            ]);

            if (parentComment?.data) {
              // Remove deleted comment in parent childComment if still exists
              if (parentComment.data.children.includes(comments[0].commentId)) {
                const newParentComment = {
                  ...parentComment.data,
                  childrenNumber: parentComment.data.childrenNumber - 1,
                  children: [
                    ...new Set([
                      ...parentComment.data.children.filter(id => id !== comments[0].commentId),
                    ]),
                  ],
                };
                pushToCache(['comment', 'get', comments[0].parentId], newParentComment);

                setTimeout(() => {
                  // NOTE: This is workaround solution for emitting event not work properly.
                  fireEvent('comment.updated', {
                    comments: [newParentComment],
                    commentChildren: [],
                    files: [],
                    users: [],
                    communityUsers: [],
                  });
                }, 200);
              }
            }
          }

          const queries = queryCache<Amity.InternalComment[]>(['comment', 'query'])?.filter(
            ({ key }) => (key[2] as Amity.QueryComments)?.referenceId === comment.data.referenceId,
          );

          queries?.map(({ key, data }) => upsertInCache(key, data as any, { cachedAt: -1 }));
        }

        callback(LinkedObject.comment(comment.data));
      }
    }
  };

  return createEventSubscriber(client, event, event, filter);
};
