import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';
import { getActiveClient } from '~/client';
import { saveCommunityUsers } from '~/communityRepository/utils/saveCommunityUsers';
import { EnumCommunityActions } from './enums';
import { EnumCommunityMemberActions } from '~/communityRepository/communityMembership/observers/getMembers/enums';

export class RecommendedCommunitiesQueryStreamController extends QueryStreamController<
  Amity.RecommendedCommunityPayload,
  Amity.RecommendedCommunityLiveCollection
> {
  private notifyChange: (params: Amity.LiveCollectionNotifyParams) => void;

  private preparePayload: (
    response: Amity.RecommendedCommunityPayload,
  ) => Amity.ProcessedCommunityPayload;

  constructor(
    query: Amity.RecommendedCommunityLiveCollection,
    cacheKey: string[],
    notifyChange: (params: Amity.LiveCollectionNotifyParams) => void,
    preparePayload: (
      response: Amity.RecommendedCommunityPayload,
    ) => Amity.ProcessedCommunityPayload,
  ) {
    super(query, cacheKey);
    this.notifyChange = notifyChange;
    this.preparePayload = preparePayload;
  }

  async saveToMainDB(response: Amity.RecommendedCommunityPayload) {
    const processedPayload = await this.preparePayload(response);

    const client = getActiveClient();
    const cachedAt = client.cache && Date.now();

    if (client.cache) {
      ingestInCache(processedPayload, { cachedAt });
      saveCommunityUsers(response.communities, response.communityUsers);
    }
  }

  appendToQueryStream(
    response: Amity.RecommendedCommunityPayload & Partial<Amity.Pagination>,
    direction: Amity.LiveCollectionPageDirection,
    refresh = false,
  ) {
    if (refresh) {
      pushToCache(this.cacheKey, {
        data: response.communities.map(getResolver('community')),
      });
    } else {
      const collection = pullFromCache<Amity.RecommendedCommunityLiveCollectionCache>(
        this.cacheKey,
      )?.data;

      const communities = collection?.data ?? [];

      pushToCache(this.cacheKey, {
        ...collection,
        data: [...new Set([...communities, ...response.communities.map(getResolver('community'))])],
      });
    }
  }

  reactor(action: EnumCommunityActions | EnumCommunityMemberActions) {
    return (community: Amity.Community) => {
      const collection = pullFromCache<Amity.RecommendedCommunityLiveCollectionCache>(
        this.cacheKey,
      )?.data;
      if (!collection) return;

      pushToCache(this.cacheKey, collection);
      this.notifyChange({ origin: Amity.LiveDataOrigin.EVENT, loading: false });
    };
  }

  subscribeRTE(
    createSubscriber: {
      fn: (reactor: (channel: Amity.Community) => void) => Amity.Unsubscriber;
      action: EnumCommunityActions | EnumCommunityMemberActions;
    }[],
  ) {
    return createSubscriber.map(subscriber => subscriber.fn(this.reactor(subscriber.action)));
  }
}
