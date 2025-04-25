import { pullFromCache, queryCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { getMessageMarkers } from '~/marker/api/getMessageMarkers';
import { prepareMessagePayloadForCache } from '~/reactionRepository/utils/prepareMessagePayloadForCache';
import { inferIsDeleted } from '~/utils/inferIsDeleted';

import { MessageContentType } from '~/@types';
import { convertFromRaw as convertSubChannelFromRaw } from '~/subChannelRepository/utils/convertSubChannelFromRaw';
import { updateSubChannelCache } from '~/subChannelRepository/utils/updateSubChannelCache';
import { COLLECTION_DEFAULT_PAGINATION_LIMIT } from '~/utils/constants';

const mergePayloadWithLocal = (payload: Amity.RawMessage) => {
  const localMessage = queryCache<Amity.InternalMessage>(['message', 'get'])?.find(
    ({ data }) => data.messageId === payload.messageId,
  )?.data;

  if (localMessage) {
    return {
      ...localMessage,
      ...payload,
      // NOTE: referenceId is missing in the some payload event. If we have local message data with referenceId, use it instead.
      referenceId: localMessage.referenceId ?? payload.referenceId,
    };
  }

  return payload;
};

export function convertFromRaw(
  message: Amity.RawMessage,
  reactors?: Amity.InternalReactor[],
  event?: keyof Amity.MqttMessageEvents,
): Amity.InternalMessage {
  const mergeMessage = mergePayloadWithLocal(message);

  const {
    channelPublicId,
    childCount,
    creatorPublicId,
    mentionedUsers,
    messageFeedId,
    myReactions,
    reactionCount,
    reactions,
    referenceId,
    segment,
    messageId,
    creatorId,
    ...rest
  } = mergeMessage;

  let cache: Amity.CacheEntry<Amity.Message> | undefined;

  if (referenceId) {
    cache = pullFromCache(['message', 'get', referenceId]);
  }

  if (!cache) {
    cache = pullFromCache(['message', 'get', messageId]);
  }

  const out: Amity.InternalMessage = {
    ...rest,
    messageId,
    channelId: channelPublicId,
    channelSegment: segment,
    childrenNumber: childCount,
    creatorId: creatorPublicId,
    creatorPrivateId: message.creatorId,
    reactions: reactions ?? {},
    /*
     * Previously, myReactions were added only if it was part of the payload.
     * So empty myReactions were not present. So I've edited the payload to add
     * a default for those cases.
     *
     * Check git blame for previous iteration
     */
    myReactions: myReactions || (cache?.data.myReactions ?? []),
    reactionsCount: reactionCount,
    subChannelId: messageFeedId,
    uniqueId: cache ? cache.data.uniqueId : messageId,
    referenceId,
    syncState: Amity.SyncState.Synced,
  };

  if (mentionedUsers) {
    out.mentionees = mentionedUsers.map(mention => {
      if (mention.type === 'channel') {
        return mention;
      }

      return { type: 'user', userIds: mention.userPublicIds };
    });
  }

  if (reactors && reactors.length && event) {
    // mqtt event
    prepareMessagePayloadForCache(out, reactors, event);
  }

  return out;
}

const preUpdateMessageCache = (rawPayload: Amity.MessagePayload) => {
  ingestInCache({
    messages: rawPayload.messages.map(message => convertFromRaw(message, rawPayload.reactions)),
  });
};

const DEBOUNCE_TIME = 2000;
const currentDebounceMap: Record<string, NodeJS.Timeout | undefined> = {};

export const prepareMessagePayload = async (
  payload: Amity.MessagePayload,
  event?: keyof Amity.MqttMessageEvents,
): Promise<Amity.ProcessedMessagePayload> => {
  const markerIds = payload.messages.map(({ messageId }) => messageId);

  if (markerIds.length > 0) {
    // since the get markers method requires a channel cache to function with the reducer.
    preUpdateMessageCache(payload);

    const markerIdsKey = markerIds.join('');

    if (currentDebounceMap[markerIdsKey]) {
      clearTimeout(currentDebounceMap[markerIdsKey]);
    }
    currentDebounceMap[markerIdsKey] = setTimeout(() => {
      try {
        getMessageMarkers(markerIds);
      } catch (_error) {
        // do nothing
      }
    }, DEBOUNCE_TIME);
  }

  const { messageFeeds, ...restPayload } = payload;

  // upsert messageFeeds to subchannel cache because messageFeeds from event payload not include messagePreviewId
  if (messageFeeds && messageFeeds.length > 0) {
    messageFeeds?.forEach(messageFeed => {
      const subChannelCache =
        pullFromCache<Amity.SubChannel>(['subChannel', 'get', messageFeed.messageFeedId])?.data ??
        {};

      // exclude getter properties from existing subChannel cache, update only other properties to existing subChannel cache
      const { unreadCount, isMentioned, ...restSubChannel } = convertSubChannelFromRaw(messageFeed);

      updateSubChannelCache(messageFeed.messageFeedId, subChannelCache, restSubChannel);
    });
  }

  return {
    ...restPayload,
    messages: payload.messages.map(m => convertFromRaw(m, payload.reactions, event)),
  };
};

type RawQueryMessages = Omit<
  Amity.QueryMessages,
  /*
   * include deleted is for internal sdk use only. The server expects isDeleted
   */
  | 'page'
  | 'sortBy'
  | 'subChannelId'
  | 'tags'
  | 'includeDeleted'
  | 'aroundMessageId'
  | 'dataType'
  | 'includingTags'
  | 'excludingTags'
> & {
  includeTags?: Amity.QueryMessages['includingTags'];
  excludeTags?: Amity.QueryMessages['excludingTags'];
  isDeleted?: Amity.Message['isDeleted'];
  messageFeedId: Amity.QueryMessages['subChannelId'];
  dataType?: Amity.MessageContentType;
  options: {
    sortBy?: Amity.QueryMessages['sortBy'];
    token?: string;
    limit?: number;
    around?: Amity.Message['messageId'];
  };
};

export function convertParams({
  subChannelId,
  mentionees,
  dataType,
  data,
  ...rest
}: Partial<Amity.Message>): Record<string, any> {
  if (dataType === MessageContentType.IMAGE || dataType === MessageContentType.FILE) {
    return {
      messageFeedId: subChannelId,
      mentionedUsers: mentionees,
      dataType,
      data: {
        caption: '',
        ...(data as Record<string, any>),
      },
      ...rest,
    };
  }
  return { messageFeedId: subChannelId, mentionedUsers: mentionees, dataType, data, ...rest };
}

export function convertQueryParams({
  sortBy,
  subChannelId,
  includingTags,
  excludingTags,
  includeDeleted,
  aroundMessageId,
  limit,
  type,
  ...rest
}: Amity.MessagesLiveCollection): RawQueryMessages {
  const out: RawQueryMessages = {
    ...rest,
    messageFeedId: subChannelId,
    isDeleted: inferIsDeleted(includeDeleted),
    options: {
      sortBy,
      limit: limit || COLLECTION_DEFAULT_PAGINATION_LIMIT,
      around: aroundMessageId,
    },
  };

  if (includingTags) {
    out.includeTags = includingTags;
  }

  if (type) {
    out.dataType = type;
  }

  if (excludingTags) {
    out.excludeTags = excludingTags;
  }

  return out;
}
