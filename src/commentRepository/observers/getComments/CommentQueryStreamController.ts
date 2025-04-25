import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';
import { getActiveClient } from '~/client';
import { EnumCommentActions } from './enums';

export class CommentQueryStreamController extends QueryStreamController<
  Amity.CommentPayload,
  Amity.CommentLiveCollection
> {
  private notifyChange: (params: Amity.LiveCollectionNotifyParams) => void;

  private preparePayload: (response: Amity.CommentPayload) => Amity.ProcessedCommentPayload;

  constructor(
    query: Amity.CommentLiveCollection,
    cacheKey: string[],
    notifyChange: (params: Amity.LiveCollectionNotifyParams) => void,
    preparePayload: (response: Amity.CommentPayload) => Amity.ProcessedCommentPayload,
  ) {
    super(query, cacheKey);
    this.notifyChange = notifyChange;
    this.preparePayload = preparePayload;
  }

  async saveToMainDB(response: Amity.CommentPayload) {
    const processedPayload = await this.preparePayload(response);

    const client = getActiveClient();
    const cachedAt = client.cache && Date.now();

    if (client.cache) {
      ingestInCache(processedPayload, { cachedAt });
    }
  }

  appendToQueryStream(
    response: Amity.CommentPayload & Partial<Amity.Pagination>,
    direction: Amity.LiveCollectionPageDirection,
    refresh = false,
  ) {
    if (refresh) {
      pushToCache(this.cacheKey, {
        data: response.comments.map(getResolver('comment')),
      });
    } else {
      const collection = pullFromCache<Amity.CommunityLiveCollectionCache>(this.cacheKey)?.data;

      const comments = collection?.data ?? [];

      pushToCache(this.cacheKey, {
        ...collection,
        data: [...new Set([...comments, ...response.comments.map(getResolver('comment'))])],
      });
    }
  }

  reactor(action: EnumCommentActions) {
    return (comment: Amity.InternalComment) => {
      const collection = pullFromCache<Amity.CommentLiveCollectionCache>(this.cacheKey)?.data;

      if (
        this.query.referenceId !== comment.referenceId ||
        this.query.referenceType !== comment.referenceType ||
        !collection
      ) {
        return;
      }

      if (this.query.parentId && this.query.parentId !== comment.parentId) {
        return;
      }

      if (!this.query.parentId && comment.parentId) {
        return;
      }

      if (action === EnumCommentActions.OnCommentCreated) {
        collection.data = [...new Set([comment.commentId, ...collection.data])];
      }

      pushToCache(this.cacheKey, collection);
      this.notifyChange({ origin: Amity.LiveDataOrigin.EVENT, loading: false });
    };
  }

  subscribeRTE(
    createSubscriber: {
      fn: (reactor: (comment: Amity.InternalComment) => void) => Amity.Unsubscriber;
      action: EnumCommentActions;
    }[],
  ) {
    return createSubscriber.map(subscriber => subscriber.fn(this.reactor(subscriber.action)));
  }
}
