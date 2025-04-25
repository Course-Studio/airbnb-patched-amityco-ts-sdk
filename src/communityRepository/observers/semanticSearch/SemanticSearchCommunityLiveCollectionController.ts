import hash from 'object-hash';
import { pullFromCache, pushToCache } from '~/cache/api';
import { SemanticSearchCommunityPaginationController } from './SemanticSearchCommunityPaginationController';
import { SemanticSearchCommunityQueryStreamController } from './SemanticSearchCommunityQueryStreamController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import {
  onCommunityCreated,
  onCommunityDeleted,
  onCommunityUpdated,
} from '~/communityRepository/events';

import {
  onCommunityJoined,
  onCommunityLeft,
  onLocalCommunityJoined,
  onLocalCommunityLeft,
  onCommunityUserChanged,
} from '~/communityRepository/communityMembership';

import { isNonNullable } from '~/utils';
import { EnumCommunityActions } from './enums';
import { prepareSemanticSearchCommunityPayload } from '~/communityRepository/utils/payload';

import { getActiveClient } from '~/client';
import { EnumCommunityMemberActions } from '~/communityRepository/communityMembership/observers/getMembers/enums';
import { filterByCommunityMembership } from '~/core/query';

export class SemanticSearchCommunityLiveCollectionController extends LiveCollectionController<
  'semanticSearchCommunity',
  Amity.SemanticSearchCommunityLiveCollection,
  Amity.Community,
  SemanticSearchCommunityPaginationController
> {
  private queryStreamController: SemanticSearchCommunityQueryStreamController;

  private query: Amity.SemanticSearchCommunityLiveCollection;

  constructor(
    query: Amity.SemanticSearchCommunityLiveCollection,
    callback: Amity.LiveCollectionCallback<Amity.Community>,
  ) {
    const queryStreamId = hash(query);
    const cacheKey = ['community', 'collection', queryStreamId];
    const paginationController = new SemanticSearchCommunityPaginationController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;

    this.queryStreamController = new SemanticSearchCommunityQueryStreamController(
      this.query,
      this.cacheKey,
      this.notifyChange.bind(this),
      prepareSemanticSearchCommunityPayload,
    );

    this.callback = callback.bind(this);
    this.loadPage({ initial: true });
  }

  protected setup() {
    const collection = pullFromCache<Amity.SemanticSearchCommunityLiveCollectionCache>(
      this.cacheKey,
    )?.data;
    if (!collection) {
      pushToCache(this.cacheKey, {
        data: [],
        params: {},
      });
    }
  }

  protected async persistModel(
    queryPayload: Amity.SemanticSearchCommunityPayload & Amity.Pagination,
  ) {
    await this.queryStreamController.saveToMainDB(queryPayload);
  }

  protected persistQueryStream({
    response,
    direction,
    refresh,
  }: Amity.LiveCollectionPersistQueryStreamParams<'semanticSearchCommunity'>) {
    this.queryStreamController.appendToQueryStream(response, direction, refresh);
  }

  startSubscription() {
    return this.queryStreamController.subscribeRTE([
      { fn: onCommunityCreated, action: EnumCommunityActions.OnCommunityCreated },
      { fn: onCommunityDeleted, action: EnumCommunityActions.OnCommunityDeleted },
      { fn: onCommunityUpdated, action: EnumCommunityActions.OnCommunityUpdated },
      { fn: onCommunityJoined, action: EnumCommunityMemberActions.OnCommunityJoined },
      { fn: onCommunityLeft, action: EnumCommunityMemberActions.OnCommunityLeft },
      { fn: onCommunityUserChanged, action: EnumCommunityMemberActions.OnMemberCountChanged },
      { fn: onLocalCommunityJoined, action: EnumCommunityMemberActions.OnCommunityJoined },
      { fn: onLocalCommunityLeft, action: EnumCommunityMemberActions.OnCommunityLeft },
    ]);
  }

  notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams) {
    const collection = pullFromCache<Amity.SemanticSearchCommunityLiveCollectionCache>(
      this.cacheKey,
    )?.data;
    if (!collection) return;

    const data = this.applyFilter(
      collection.data
        .map(communityIdWithScore => {
          const [communityId, score] = communityIdWithScore.split(':');
          return {
            communityId,
            score: parseFloat(score),
          };
        })
        .sort((a, b) => b.score - a.score)
        .map(
          ({ communityId }) => pullFromCache<Amity.Community>(['community', 'get', communityId])!,
        )
        .filter(isNonNullable)
        .map(({ data }) => data) ?? [],
    );

    if (!this.shouldNotify(data) && origin === 'event') return;

    this.callback({
      onNextPage: () => this.loadPage({ direction: Amity.LiveCollectionPageDirection.NEXT }),
      data,
      hasNextPage: !!this.paginationController.getNextToken(),
      loading,
      error,
    });
  }

  applyFilter(data: Amity.Community[]) {
    const { userId } = getActiveClient();

    let communities = data;

    if (this.query.categoryIds) {
      communities = communities.filter(c =>
        c.categoryIds?.some((id: string) => {
          if (!this.query.categoryIds) return true;
          if (this.query.categoryIds.length === 0) return true;

          return this.query.categoryIds.includes(id);
        }),
      );
    }

    if (this.query.tags) {
      communities = communities.filter(c => c.tags?.some(t => this.query.tags?.includes(t)));
    }

    if (this.query.communityMembershipStatus && userId) {
      communities = filterByCommunityMembership(
        communities,
        this.query.communityMembershipStatus,
        userId,
      );
    }

    return communities;
  }
}
