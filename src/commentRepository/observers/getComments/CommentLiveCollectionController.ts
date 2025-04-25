import hash from 'object-hash';
import { pullFromCache, pushToCache } from '~/cache/api';
import { CommentPaginationController } from './CommentPaginationController';
import { CommentQueryStreamController } from './CommentQueryStreamController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import {
  onCommentCreated,
  onCommentUpdated,
  onCommentDeleted,
  onCommentFlagged,
  onCommentUnflagged,
  onCommentReactionAdded,
  onCommentReactionRemoved,
} from '~/commentRepository/events';
import { filterByPropEquality, sortByFirstCreated, sortByLastCreated } from '~/core/query';
import { isNonNullable } from '~/utils';
import { EnumCommentActions } from './enums';
import { LinkedObject } from '~/utils/linkedObject';
import { prepareCommentPayload } from '~/commentRepository/utils/payload';
import { onCommentCreatedLocal } from '~/commentRepository/events/onCommentCreatedLocal';
import { onCommentDeleteLocal } from '~/commentRepository/events/onCommentDeletedLocal';
import { onLocalCommentReactionAdded } from '~/commentRepository/events/onLocalCommentReactionAdded';
import { onLocalCommentReactionRemoved } from '~/commentRepository/events/onLocalCommentReactionRemoved';

export class CommentLiveCollectionController extends LiveCollectionController<
  'comment',
  Amity.CommentLiveCollection,
  Amity.Comment,
  CommentPaginationController
> {
  private queryStreamController: CommentQueryStreamController;

  private query: Amity.CommentLiveCollection;

  constructor(
    query: Amity.CommentLiveCollection,
    callback: Amity.LiveCollectionCallback<Amity.Comment>,
  ) {
    const queryStreamId = hash(query);
    const cacheKey = ['comments', 'collection', queryStreamId];
    const paginationController = new CommentPaginationController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;
    this.queryStreamController = new CommentQueryStreamController(
      this.query,
      this.cacheKey,
      this.notifyChange.bind(this),
      prepareCommentPayload,
    );

    this.callback = callback.bind(this);
    this.loadPage({ initial: true });
  }

  protected setup() {
    const collection = pullFromCache<Amity.CommentLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) {
      pushToCache(this.cacheKey, {
        data: [],
        params: {},
      });
    }
  }

  protected async persistModel(queryPayload: Amity.CommentPayload & Amity.Pagination) {
    await this.queryStreamController.saveToMainDB(queryPayload);
  }

  protected persistQueryStream({
    response,
    direction,
    refresh,
  }: Amity.LiveCollectionPersistQueryStreamParams<'comment'>) {
    this.queryStreamController.appendToQueryStream(response, direction, refresh);
  }

  startSubscription() {
    return this.queryStreamController.subscribeRTE([
      { fn: onCommentCreatedLocal, action: EnumCommentActions.OnCommentCreated },
      { fn: onCommentDeleteLocal, action: EnumCommentActions.OnCommentDeleted },
      { fn: onCommentCreated, action: EnumCommentActions.OnCommentCreated },
      { fn: onCommentUpdated, action: EnumCommentActions.OnCommentUpdated },
      { fn: onCommentDeleted, action: EnumCommentActions.OnCommentDeleted },
      { fn: onCommentFlagged, action: EnumCommentActions.OnCommentFlagged },
      { fn: onCommentUnflagged, action: EnumCommentActions.OnCommentUnflagged },
      { fn: onCommentReactionAdded, action: EnumCommentActions.OnCommentReactionAdded },
      { fn: onCommentReactionRemoved, action: EnumCommentActions.OnCommentReactionRemoved },
      { fn: onLocalCommentReactionAdded, action: EnumCommentActions.OnCommentReactionAdded },
      { fn: onLocalCommentReactionRemoved, action: EnumCommentActions.OnCommentReactionRemoved },
    ]);
  }

  notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams) {
    const collection = pullFromCache<Amity.CommentLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) return;

    const data = this.applyFilter(
      collection.data
        .map(id => pullFromCache<Amity.InternalComment>(['comment', 'get', id])!)
        .filter(isNonNullable)
        .map(({ data }) => data) ?? [],
    ).map(LinkedObject.comment);

    if (!this.shouldNotify(data) && origin === 'event') return;

    this.callback({
      onNextPage: () => this.loadPage({ direction: Amity.LiveCollectionPageDirection.NEXT }),
      data,
      hasNextPage: !!this.paginationController.getNextToken(),
      loading,
      error,
    });
  }

  applyFilter(data: Amity.InternalComment[]) {
    let comments = data;

    if (!this.query.includeDeleted) {
      comments = filterByPropEquality(comments, 'isDeleted', false);
    }

    if (this.query.parentId) {
      comments = comments.filter(comment => comment.parentId === this.query.parentId);
    }

    if (typeof this.query.hasFlag === 'boolean') {
      if (this.query.hasFlag) {
        comments = comments.filter(comment => comment.hashFlag != null);
      } else {
        comments = comments.filter(comment => comment.hashFlag == null);
      }
    }

    if (this.query.dataTypes) {
      if (this.query.dataTypes.matchType === 'exact') {
        comments = comments.filter(comment => {
          const sortedDataTypesQueryValue = this.query.dataTypes?.values.sort() || [];
          const sortedDataTypesCommentValue = comment.dataTypes?.sort() || [];

          if (sortedDataTypesCommentValue.length !== sortedDataTypesQueryValue.length) {
            return false;
          }

          return sortedDataTypesQueryValue.every(
            (value, index) => value === sortedDataTypesCommentValue[index],
          );
        });
      }
      if (this.query.dataTypes.matchType === 'any') {
        comments = comments.filter(comment =>
          this.query.dataTypes?.values.some(value => comment.dataTypes?.includes(value)),
        );
      }
    }

    switch (this.query.sortBy) {
      case 'firstCreated':
        comments = comments.sort(sortByFirstCreated);
        break;
      case 'lastCreated':
      default:
        comments = comments.sort(sortByLastCreated);
        break;
    }

    return comments;
  }
}
