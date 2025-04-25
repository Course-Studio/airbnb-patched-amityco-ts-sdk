import { pullFromCache } from '~/cache/api/pullFromCache';
import { userLinkedObject } from './userLinkedObject';
import { isNonNullable } from '~/utils';

export const commentLinkedObject = (comment: Amity.InternalComment): Amity.Comment => {
  return {
    ...comment,
    get target(): Amity.CommentTarget {
      const commentTypes: Amity.CommentTarget = {
        type: comment.targetType,
      };

      if (comment.targetType === 'user') {
        return {
          ...commentTypes,
          userId: comment.targetId,
        };
      }

      if (commentTypes.type === 'content') {
        return {
          ...commentTypes,
          contentId: comment.targetId,
        };
      }

      if (commentTypes.type === 'community') {
        const cacheData = pullFromCache<Amity.Membership<'community'>>([
          'communityUsers',
          'get',
          `${comment.targetId}#${comment.userId}`,
        ]);

        return {
          ...commentTypes,
          communityId: comment.targetId,
          creatorMember: cacheData?.data,
        };
      }

      return {
        type: 'unknown',
      };
    },
    get creator(): Amity.User | undefined {
      const cacheData = pullFromCache<Amity.User>(['user', 'get', comment.userId]);
      if (cacheData?.data) return userLinkedObject(cacheData.data);
      return undefined;
    },
    get childrenComment(): Amity.Comment[] {
      return comment.children
        .map(childCommentId => {
          const commentCache = pullFromCache<Amity.InternalComment>([
            'comment',
            'get',
            childCommentId,
          ]);

          if (!commentCache?.data) return;
          return commentCache?.data;
        })
        .filter(isNonNullable)
        .map(item => commentLinkedObject(item!));
    },
  };
};
