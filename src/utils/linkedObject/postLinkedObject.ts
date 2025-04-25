import { pullFromCache } from '~/cache/api';
import { commentLinkedObject } from '~/utils/linkedObject/commentLinkedObject';
import AnalyticsEngine from '../../analytic/service/analytic/AnalyticsEngine';
import { userLinkedObject } from './userLinkedObject';

export const postLinkedObject = (post: Amity.InternalPost): Amity.Post => {
  return {
    ...post,
    analytics: {
      markAsViewed: () => {
        const analyticsEngineInstance = AnalyticsEngine.getInstance();
        analyticsEngineInstance.markPostAsViewed(post.postId);
      },
    },
    get latestComments(): (Amity.Comment | null)[] {
      if (!post.comments) return [];
      return (
        post.comments
          .map(commentId => {
            const commentCached = pullFromCache<Amity.InternalComment>([
              'comment',
              'get',
              commentId,
            ])?.data;

            if (!commentCached) return null;

            return commentLinkedObject(commentCached);
          })
          .filter(Boolean) || []
      );
    },
    get creator(): Amity.User | undefined {
      const cacheData = pullFromCache<Amity.User>(['user', 'get', post.postedUserId]);
      if (!cacheData?.data) return;
      return userLinkedObject(cacheData.data);
    },
  };
};
