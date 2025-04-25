/* eslint-disable no-use-before-define */
import { QueryStreamController } from '~/core/liveCollection/QueryStreamController';
import { pullFromCache, pushToCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getResolver } from '~/core/model';
import { getActiveClient } from '~/client';

export class ChannelMemberQueryStreamController extends QueryStreamController<
  Amity.ChannelMembershipPayload,
  Amity.ChannelMembersLiveCollection
> {
  private notifyChange: (params: Amity.LiveCollectionNotifyParams) => void;

  private preparePayload: (
    response: Amity.ChannelMembershipPayload,
  ) => Promise<Amity.ProcessedChannelPayload>;

  constructor(
    query: Amity.ChannelMembersLiveCollection,
    cacheKey: string[],
    notifyChange: (params: Amity.LiveCollectionNotifyParams) => void,
    preparePayload: (
      response: Amity.ChannelMembershipPayload,
    ) => Promise<Amity.ProcessedChannelPayload>,
  ) {
    super(query, cacheKey);
    this.notifyChange = notifyChange;
    this.preparePayload = preparePayload;
  }

  async saveToMainDB(response: Amity.ChannelMembershipPayload) {
    const processedPayload = await this.preparePayload(response);

    const client = getActiveClient();
    const cachedAt = client.cache && Date.now();

    if (client.cache) {
      ingestInCache(processedPayload, { cachedAt });
    }
  }

  appendToQueryStream(
    response: Amity.ChannelPayload & Partial<Amity.Pagination>,
    direction: Amity.LiveCollectionPageDirection,
    refresh = false,
  ) {
    if (refresh) {
      pushToCache(this.cacheKey, {
        data: response.channelUsers.map(({ channelId, userId }) =>
          getResolver('channelUsers')({ channelId, userId }),
        ),
      });
    } else {
      const collection = pullFromCache<Amity.ChannelMembersLiveCollectionCache>(
        this.cacheKey,
      )?.data;

      const channelUsers = collection?.data ?? [];

      pushToCache(this.cacheKey, {
        ...collection,
        data: [
          ...new Set([
            ...channelUsers,
            ...response.channelUsers.map(({ channelId, userId }) =>
              getResolver('channelUsers')({ channelId, userId }),
            ),
          ]),
        ],
      });
    }
  }

  reactor(action: string) {
    return (channel: Amity.StaticInternalChannel, channelMember: Amity.Membership<'channel'>) => {
      if (this.query.channelId !== channelMember.channelId) return;

      const collection = pullFromCache<Amity.ChannelMembersLiveCollectionCache>(
        this.cacheKey,
      )?.data;
      if (!collection) return;

      const channelMemberCacheId = getResolver('channelUsers')({
        channelId: this.query.channelId,
        userId: channelMember.userId,
      });

      if (channelMember.membership === 'none') {
        collection.data = collection.data.filter(m => m !== channelMemberCacheId);
      } else if (!collection.data.includes(channelMemberCacheId)) {
        collection.data = [channelMemberCacheId, ...collection.data];
      }

      pushToCache(this.cacheKey, collection);
      this.notifyChange({ origin: Amity.LiveDataOrigin.EVENT, loading: false });
    };
  }

  subscribeRTE(
    createSubscriber: {
      fn: (
        reactor: (
          channel: Amity.StaticInternalChannel,
          channelMember: Amity.Membership<'channel'>,
        ) => void,
      ) => Amity.Unsubscriber;
      action: string;
    }[],
  ) {
    return createSubscriber.map(subscriber => subscriber.fn(this.reactor(subscriber.action)));
  }
}
