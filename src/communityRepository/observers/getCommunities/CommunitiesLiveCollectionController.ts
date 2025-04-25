import hash from 'object-hash';
import { pullFromCache, pushToCache } from '~/cache/api';
import { CommunitiesPaginationController } from './CommunitiesPaginationController';
import { CommunitiesQueryStreamController } from './CommunitiesQueryStreamController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import {
  onCommunityCreated,
  onCommunityDeleted,
  onCommunityUpdated,
} from '~/communityRepository/events';
import {
  filterByCommunityMembership,
  filterByPropEquality,
  sortByDisplayName,
  sortByFirstCreated,
  sortByLastCreated,
} from '~/core/query';
import { prepareCommunityPayload } from '~/communityRepository/utils';
import { getActiveClient } from '~/client';
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

export class CommunityLiveCollectionController extends LiveCollectionController<
  'community',
  Amity.CommunityLiveCollection,
  Amity.Community,
  CommunitiesPaginationController
> {
  private queryStreamController: CommunitiesQueryStreamController;

  private query: Amity.CommunityLiveCollection;

  constructor(
    query: Amity.CommunityLiveCollection,
    callback: Amity.LiveCollectionCallback<Amity.Community>,
  ) {
    const queryStreamId = hash(query);
    const cacheKey = ['community', 'collection', queryStreamId];
    const paginationController = new CommunitiesPaginationController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;
    this.queryStreamController = new CommunitiesQueryStreamController(
      this.query,
      this.cacheKey,
      this.notifyChange.bind(this),
      prepareCommunityPayload,
    );

    this.callback = callback.bind(this);
    this.loadPage({ initial: true });
  }

  protected setup() {
    const collection = pullFromCache<Amity.CommunityLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) {
      pushToCache(this.cacheKey, {
        data: [],
        params: {},
      });
    }
  }

  protected async persistModel(queryPayload: Amity.CommunityPayload & Amity.Pagination) {
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
    const collection = pullFromCache<Amity.CommunityLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) return;

    const data = this.applyFilter(
      collection.data
        .map(id => pullFromCache<Amity.Community>(['community', 'get', id]))
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

    if (!this.query.includeDeleted) {
      communities = filterByPropEquality(communities, 'isDeleted', false);
    }

    if (this.query.categoryId) {
      communities = communities.filter(c => c.categoryIds?.includes(this.query.categoryId!));
    }

    if (this.query.tags) {
      communities = communities.filter(c => c.tags?.some(t => this.query.tags?.includes(t)));
    }

    if (this.query.membership && userId) {
      communities = filterByCommunityMembership(communities, this.query.membership, userId);
    }

    const sortFn = (() => {
      switch (this.query.sortBy) {
        case 'firstCreated':
          return sortByFirstCreated;
        case 'lastCreated':
          return sortByLastCreated;
        default:
          return sortByLastCreated;
      }
    })();

    communities = communities.sort(sortFn);

    return communities;
  }
}
