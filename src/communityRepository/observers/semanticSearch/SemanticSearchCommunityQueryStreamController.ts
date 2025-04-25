import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getActiveClient } from '~/client';
// TODO: move emum to be the share value
import { EnumCommunityActions } from './enums';
import { EnumCommunityMemberActions } from '~/communityRepository/communityMembership/observers/getMembers/enums';
import { prepareSemanticCommunitiesReferenceId } from './utils';

export class SemanticSearchCommunityQueryStreamController extends QueryStreamController<
  Amity.SemanticSearchCommunityPayload,
  Amity.SemanticSearchCommunityLiveCollection
> {
  private notifyChange: (params: Amity.LiveCollectionNotifyParams) => void;

  private preparePayload: (
    response: Amity.SemanticSearchCommunityPayload,
  ) => Amity.ProcessedSemanticSearchCommunityPayload;

  constructor(
    query: Amity.SemanticSearchCommunityLiveCollection,
    cacheKey: string[],
    notifyChange: (params: Amity.LiveCollectionNotifyParams) => void,
    preparePayload: (
      response: Amity.SemanticSearchCommunityPayload,
    ) => Amity.ProcessedSemanticSearchCommunityPayload,
  ) {
    super(query, cacheKey);
    this.notifyChange = notifyChange;
    this.preparePayload = preparePayload;
  }

  async saveToMainDB(response: Amity.SemanticSearchCommunityPayload) {
    const processedPayload = this.preparePayload(response);

    const client = getActiveClient();
    const cachedAt = client.cache && Date.now();

    if (client.cache) {
      ingestInCache(processedPayload, { cachedAt });
    }
  }

  appendToQueryStream(
    response: Amity.SemanticSearchCommunityPayload & Partial<Amity.Pagination>,
    direction: Amity.LiveCollectionPageDirection,
    refresh = false,
  ) {
    if (refresh) {
      pushToCache(this.cacheKey, {
        data: prepareSemanticCommunitiesReferenceId(response),
      });
    } else {
      const collection = pullFromCache<Amity.CommunityLiveCollectionCache>(this.cacheKey)?.data;

      const communities = collection?.data ?? [];

      pushToCache(this.cacheKey, {
        ...collection,
        data: [...new Set([...communities, ...prepareSemanticCommunitiesReferenceId(response)])],
      });
    }
  }

  reactor(action: EnumCommunityActions | EnumCommunityMemberActions) {
    return (community: Amity.Community) => {
      const collection = pullFromCache<Amity.CommunityLiveCollectionCache>(this.cacheKey)?.data;
      if (!collection) return;

      collection.data = [...new Set([community.communityId, ...collection.data])];

      pushToCache(this.cacheKey, collection);
      this.notifyChange({ origin: Amity.LiveDataOrigin.EVENT, loading: false });
    };
    //
  }

  subscribeRTE(
    createSubscriber: {
      fn: (reactor: (community: Amity.Community) => void) => Amity.Unsubscriber;
      action: EnumCommunityActions | EnumCommunityMemberActions;
    }[],
  ) {
    return createSubscriber.map(subscriber => subscriber.fn(this.reactor(subscriber.action)));
  }
}
