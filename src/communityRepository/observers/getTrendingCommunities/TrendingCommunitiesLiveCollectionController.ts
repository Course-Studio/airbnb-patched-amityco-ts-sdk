import hash from 'object-hash';
import { pullFromCache, pushToCache } from '~/cache/api';
import { TrendingCommunitiesPaginationController } from './TrendingCommunitiesPaginationController';
import { TrendingCommunitiesQueryStreamController } from './TrendingCommunitiesQueryStreamController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import { onCommunityDeleted, onCommunityUpdated } from '~/communityRepository/events';
import { prepareCommunityPayload } from '~/communityRepository/utils';
import { EnumCommunityActions } from './enums';
import { EnumCommunityMemberActions } from '~/communityRepository/communityMembership/observers/getMembers/enums';
import {
  onCommunityJoined,
  onCommunityLeft,
  onLocalCommunityJoined,
  onLocalCommunityLeft,
  onCommunityUserChanged,
} from '~/communityRepository/communityMembership';
import { isNonNullable } from '~/utils';

export class TrendingCommunityLiveCollectionController extends LiveCollectionController<
  'community',
  Amity.TrendingCommunityLiveCollection,
  Amity.Community,
  TrendingCommunitiesPaginationController
> {
  private queryStreamController: TrendingCommunitiesQueryStreamController;

  private query: Amity.TrendingCommunityLiveCollection;

  constructor(
    query: Amity.TrendingCommunityLiveCollection,
    callback: Amity.LiveCollectionCallback<Amity.Community>,
  ) {
    const queryStreamId = hash(query);
    const cacheKey = ['trendingCommunity', 'collection', queryStreamId];
    const paginationController = new TrendingCommunitiesPaginationController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;
    this.queryStreamController = new TrendingCommunitiesQueryStreamController(
      this.query,
      this.cacheKey,
      this.notifyChange.bind(this),
      prepareCommunityPayload,
    );

    this.callback = callback.bind(this);
    this.loadPage({ initial: true });
  }

  protected setup() {
    const collection = pullFromCache<Amity.TrendingCommunityLiveCollectionCache>(
      this.cacheKey,
    )?.data;
    if (!collection) {
      pushToCache(this.cacheKey, {
        data: [],
        params: {},
      });
    }
  }

  protected async persistModel(queryPayload: Amity.TrendingCommunityPayload & Amity.Pagination) {
    await this.queryStreamController.saveToMainDB(queryPayload);
  }

  protected persistQueryStream({
    response,
    direction,
    refresh,
  }: Amity.LiveCollectionPersistQueryStreamParams<'community'>) {
    this.queryStreamController.appendToQueryStream(response, direction, refresh);
  }

  startSubscription() {
    return this.queryStreamController.subscribeRTE([
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
    const collection = pullFromCache<Amity.TrendingCommunityLiveCollectionCache>(
      this.cacheKey,
    )?.data;
    if (!collection) return;

    const data =
      collection.data
        .map(id => pullFromCache<Amity.Community>(['community', 'get', id]))
        .filter(isNonNullable)
        .map(({ data }) => data) ?? [];

    if (!this.shouldNotify(data) && origin === 'event') return;

    this.callback({
      onNextPage: () => this.loadPage({ direction: Amity.LiveCollectionPageDirection.NEXT }),
      data,
      hasNextPage: !!this.paginationController.getNextToken(),
      loading,
      error,
    });
  }
}
