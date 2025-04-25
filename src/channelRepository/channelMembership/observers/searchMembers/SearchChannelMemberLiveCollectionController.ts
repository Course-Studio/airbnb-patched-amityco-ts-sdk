/* eslint-disable no-use-before-define */
import hash from 'object-hash';
import { pullFromCache, pushToCache } from '~/cache/api';
import { SearchChannelMemberPaginationController } from './SearchChannelMemberPaginationController';
import { SearchChannelMemberQueryStreamController } from './SearchChannelMemberQueryStreamController';
import { LiveCollectionController } from '~/core/liveCollection/LiveCollectionController';
import {
  onChannelJoined,
  onChannelLeft,
  onChannelMemberAdded,
  onChannelMemberRemoved,
  onChannelMemberBanned,
  onChannelMemberUnbanned,
  onChannelMemberRoleAdded,
  onChannelMemberRoleRemoved,
} from '~/channelRepository/events';
import { filterByPropIntersection, filterBySearchTerm } from '~/core/query';
import { prepareChannelPayload } from '~/channelRepository/utils';
import { onUserDeleted } from '~/channelRepository/events/onUserDeleted';

export class SearchChannelMemberLiveCollectionController extends LiveCollectionController<
  'channelUser',
  Amity.SearchChannelMembersLiveCollection,
  Amity.Membership<'channel'>,
  SearchChannelMemberPaginationController
> {
  private queryStreamController: SearchChannelMemberQueryStreamController;

  private query: Amity.SearchChannelMembersLiveCollection;

  constructor(
    query: Amity.SearchChannelMembersLiveCollection,
    callback: Amity.LiveCollectionCallback<Amity.Membership<'channel'>>,
  ) {
    const queryStreamId = hash(query);
    const cacheKey = ['channelUsers', 'collection', queryStreamId];
    const paginationController = new SearchChannelMemberPaginationController(query);

    super(paginationController, queryStreamId, cacheKey, callback);

    this.query = query;
    this.queryStreamController = new SearchChannelMemberQueryStreamController(
      this.query,
      this.cacheKey,
      this.notifyChange.bind(this),
      prepareChannelPayload,
    );

    this.callback = callback.bind(this);
    this.loadPage({ initial: true });
  }

  protected setup() {
    const collection = pullFromCache<Amity.ChannelMembersLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) {
      pushToCache(this.cacheKey, {
        data: [],
        params: {},
      });
    }
  }

  protected async persistModel(queryPayload: Amity.ChannelMembershipPayload & Amity.Pagination) {
    await this.queryStreamController.saveToMainDB(queryPayload);
  }

  protected persistQueryStream({
    response,
    direction,
    refresh,
  }: Amity.LiveCollectionPersistQueryStreamParams<'channelUser'>) {
    this.queryStreamController.appendToQueryStream(response, direction, refresh);
  }

  startSubscription() {
    return this.queryStreamController.subscribeRTE([
      { fn: onChannelJoined, action: 'onJoin' },
      { fn: onChannelLeft, action: 'onLeft' },
      { fn: onChannelMemberAdded, action: 'onMemberAdded' },
      { fn: onChannelMemberRemoved, action: 'onMemberRemoved' },
      { fn: onChannelMemberBanned, action: 'onChannelMemberBanned' },
      { fn: onChannelMemberUnbanned, action: 'onChannelMemberUnbanned' },
      { fn: onChannelMemberRoleAdded, action: 'onChannelMemberRoleAdded' },
      { fn: onChannelMemberRoleRemoved, action: 'onChannelMemberRoleRemoved' },
      { fn: onUserDeleted(this.query.channelId), action: 'onChannelMemberChanged' },
    ]);
  }

  notifyChange({ origin, loading, error }: Amity.LiveCollectionNotifyParams) {
    const collection = pullFromCache<Amity.ChannelMembersLiveCollectionCache>(this.cacheKey)?.data;
    if (!collection) return;

    const data = this.applyFilter(
      collection.data
        .map(id => pullFromCache<Amity.Membership<'channel'>>(['channelUsers', 'get', id])!)
        .filter(Boolean)
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

  applyFilter(data: Amity.Membership<'channel'>[]) {
    let channelMembers = filterByPropIntersection(data, 'roles', this.query.roles);

    if (this.query.memberships) {
      /*
       * even though membership includes muted as a possible value
       * when querying the server.
       * Muted is specified under seperarte property namely isMuted
       * Hence why I've seperately checked for it's equality
       */
      channelMembers = channelMembers.filter(member => {
        if (this.query.memberships?.includes('muted') && member.isMuted) {
          return true;
        }

        if (member.membership !== 'none') {
          return this.query.memberships?.includes(member.membership);
        }

        return false;
      });
    }

    if (this.query.includeDeleted === false) {
      channelMembers = channelMembers.filter(member => member.user?.isDeleted !== true);
    }

    return channelMembers;
  }
}
