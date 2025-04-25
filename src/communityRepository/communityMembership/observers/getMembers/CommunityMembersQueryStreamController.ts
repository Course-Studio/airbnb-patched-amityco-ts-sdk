import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';
import { getActiveClient } from '~/client';
import { EnumCommunityMemberActions } from './enums';

export class CommunityMembersQueryStreamController extends QueryStreamController<
  Amity.CommunityMembershipPayload,
  Amity.CommunityMemberLiveCollection
> {
  private notifyChange: (params: Amity.LiveCollectionNotifyParams) => void;

  private preparePayload: (
    response: Amity.CommunityMembershipPayload,
  ) => Amity.ProcessedCommunityMembershipPayload;

  constructor(
    query: Amity.CommunityMemberLiveCollection,
    cacheKey: string[],
    notifyChange: (params: Amity.LiveCollectionNotifyParams) => void,
    preparePayload: (
      response: Amity.CommunityMembershipPayload,
    ) => Amity.ProcessedCommunityMembershipPayload,
  ) {
    super(query, cacheKey);
    this.notifyChange = notifyChange;
    this.preparePayload = preparePayload;
  }

  async saveToMainDB(response: Amity.CommunityMembershipPayload) {
    const processedPayload = await this.preparePayload(response);

    const client = getActiveClient();
    const cachedAt = client.cache && Date.now();

    if (client.cache) {
      ingestInCache(processedPayload, { cachedAt });
    }
  }

  appendToQueryStream(
    response: Amity.CommunityMembershipPayload & Partial<Amity.Pagination>,
    direction: Amity.LiveCollectionPageDirection,
    refresh = false,
  ) {
    if (refresh) {
      pushToCache(this.cacheKey, {
        data: response.communityUsers.map(({ communityId, userId }) =>
          getResolver('communityUsers')({ communityId, userId }),
        ),
      });
    } else {
      const collection = pullFromCache<Amity.CommunityLiveCollectionCache>(this.cacheKey)?.data;

      const communityUsers = collection?.data ?? [];

      pushToCache(this.cacheKey, {
        ...collection,
        data: [
          ...new Set([
            ...communityUsers,
            ...response.communityUsers.map(({ communityId, userId }) =>
              getResolver('communityUsers')({ communityId, userId }),
            ),
          ]),
        ],
      });
    }
  }

  reactor(action: EnumCommunityMemberActions) {
    return (community: Amity.Community, communityMembers: Amity.Membership<'community'>[]) => {
      const collection = pullFromCache<Amity.CommunityMemberLiveCollectionCache>(
        this.cacheKey,
      )?.data;
      if (!collection) return;

      communityMembers.forEach(communityMember => {
        const communityMemberCacheId = getResolver('communityUsers')({
          communityId: this.query.communityId,
          userId: communityMember.userId,
        });

        if (communityMember.communityMembership === 'none') {
          collection.data = collection.data.filter(m => m !== communityMemberCacheId);
        } else if (!collection.data.includes(communityMemberCacheId)) {
          collection.data = [communityMemberCacheId, ...collection.data];
        }
      });

      pushToCache(this.cacheKey, collection);
      this.notifyChange({ origin: Amity.LiveDataOrigin.EVENT, loading: false });
    };
  }

  subscribeRTE(
    createSubscriber: {
      fn: (
        reactor: (channel: Amity.Community, communityUser: Amity.Membership<'community'>[]) => void,
      ) => Amity.Unsubscriber;
      action: EnumCommunityMemberActions;
    }[],
  ) {
    return createSubscriber.map(subscriber => subscriber.fn(this.reactor(subscriber.action)));
  }
}
