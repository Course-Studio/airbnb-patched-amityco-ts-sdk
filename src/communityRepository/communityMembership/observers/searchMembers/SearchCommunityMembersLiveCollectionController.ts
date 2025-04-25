/* eslint-disable no-use-before-define */
import hash from 'object-hash';
import { pullFromCache, pushToCache } from '~/cache/api';
import { SearchCommunityMembersPaginationController } from './SearchCommunityMembersPaginationController';
import { SearchCommunityMembersQueryStreamController } from './SearchCommunityMembersQueryStreamController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import {
  onCommunityJoined,
  onCommunityLeft,
  onCommunityUserBanned,
  onCommunityUserChanged,
  onCommunityUserRoleRemoved,
  onCommunityUserUnbanned,
  onLocalCommunityLeft,
  onLocalCommunityJoined,
} from '~/communityRepository/communityMembership/events';
import { filterByPropIntersection, filterBySearchTerm } from '~/core/query';
import { prepareCommunityPayload } from '~/communityRepository/utils';
import { isNonNullable } from '~/utils';
import { EnumCommunityMemberActions } from './enums';
import { onLocalCommunityRoleRemoved } from '~/communityRepository/communityModeration/events/onLocalCommunityRoleRemoved';
import { onUserDeleted } from '~/communityRepository/communityMembership/events/onUserDeleted';

export class SearchCommunityMembersLiveCollectionController extends LiveCollectionController<
  'communityUser',
  Amity.SearchCommunityMemberLiveCollection,
  Amity.Membership<'community'>,
  SearchCommunityMembersPaginationController
> {
  private queryStreamController: SearchCommunityMembersQueryStreamController;

  private query: Amity.SearchCommunityMemberLiveCollection;

  constructor(
    query: Amity.SearchCommunityMemberLiveCollection,
    callback: Amity.LiveCollectionCallback<Amity.Membership<'community'>>,
  ) {
    const queryStreamId = hash(query);
    const cacheKey = ['communityUsers', 'collection', queryStreamId];
    const paginationController = new SearchCommunityMembersPaginationController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;
    this.queryStreamController = new SearchCommunityMembersQueryStreamController(
      this.query,
      this.cacheKey,
      this.notifyChange.bind(this),
      prepareCommunityPayload,
    );

    this.callback = callback.bind(this);
    this.loadPage({ initial: true });
  }

  protected setup() {
    const collection = pullFromCache<Amity.SearchCommunityMemberLiveCollectionCache>(
      this.cacheKey,
    )?.data;
    if (!collection) {
      pushToCache(this.cacheKey, {
        data: [],
        params: {},
      });
    }
  }

  protected async persistModel(queryPayload: Amity.CommunityMembershipPayload & Amity.Pagination) {
    await this.queryStreamController.saveToMainDB(queryPayload);
  }

  protected persistQueryStream({
    response,
    direction,
    refresh,
  }: Amity.LiveCollectionPersistQueryStreamParams<'communityUser'>) {
    this.queryStreamController.appendToQueryStream(response, direction, refresh);
  }

  startSubscription() {
    return this.queryStreamController.subscribeRTE([
      { fn: onCommunityJoined, action: EnumCommunityMemberActions.OnCommunityJoined },
      { fn: onLocalCommunityJoined, action: EnumCommunityMemberActions.OnCommunityJoined },
      { fn: onCommunityLeft, action: EnumCommunityMemberActions.OnCommunityLeft },
      { fn: onLocalCommunityLeft, action: EnumCommunityMemberActions.OnCommunityLeft },
      { fn: onCommunityUserBanned, action: EnumCommunityMemberActions.OnCommunityUserBanned },
      { fn: onCommunityUserChanged, action: EnumCommunityMemberActions.OnCommunityUserChanged },
      {
        fn: onLocalCommunityRoleRemoved,
        action: EnumCommunityMemberActions.OnCommunityUserRoleRemoved,
      },
      {
        fn: onCommunityUserRoleRemoved,
        action: EnumCommunityMemberActions.OnCommunityUserRoleRemoved,
      },
      { fn: onCommunityUserUnbanned, action: EnumCommunityMemberActions.OnCommunityUserUnbanned },
      {
        fn: onUserDeleted(this.query.communityId),
        action: EnumCommunityMemberActions.OnCommunityUserChanged,
      },
    ]);
  }

  notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams) {
    const collection = pullFromCache<Amity.SearchCommunityMemberLiveCollectionCache>(
      this.cacheKey,
    )?.data;
    if (!collection) return;

    const data = this.applyFilter(
      collection.data
        .map(id => pullFromCache<Amity.Membership<'community'>>(['communityUsers', 'get', id])!)
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

  applyFilter(data: Amity.Membership<'community'>[]) {
    let communityMembers = filterByPropIntersection(data, 'roles', this.query.roles);

    if (this.query.memberships) {
      communityMembers = communityMembers.filter(({ communityMembership }) => {
        const memberships: Amity.GroupMembership[] = this.query.memberships || [];
        return memberships.includes(communityMembership);
      });
    }

    if (this.query.search) {
      communityMembers = filterBySearchTerm(communityMembers, this.query.search);
    }

    if (this.query.includeDeleted === false) {
      communityMembers = communityMembers.filter(({ user }) => user?.isDeleted !== true);
    }

    return communityMembers;
  }
}
