import { pullFromCache } from '~/cache/api/pullFromCache';
import { getResolver } from '~/core/model';

const getCachedMarker = (message: Amity.InternalMessage | Amity.RawMessage) => {
  const key = {
    creatorId: 'creatorPrivateId' in message ? message.creatorPrivateId : message.creatorId,
    feedId:
      (<Amity.RawMessage>message).messageFeedId ?? (<Amity.InternalMessage>message).subChannelId,
    contentId: message.messageId,
  };

  return pullFromCache<Amity.MessageMarker>([
    'messageMarker',
    'get',
    getResolver('messageMarker')(key),
  ])?.data;
};

export const getMessageReadCount = (
  message: Amity.InternalMessage | Amity.RawMessage,
  marker?: Amity.MessageMarker,
) =>
  // Look in the marker param first
  marker ??
  // If the marker param is not set, look in the cache
  getCachedMarker(message) ?? { readCount: 0, deliveredCount: 0 }; // and if not found in cache use default value `0`
