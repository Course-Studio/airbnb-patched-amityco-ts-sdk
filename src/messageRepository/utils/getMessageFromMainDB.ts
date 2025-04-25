import { pullFromCache } from '~/cache/api/pullFromCache';
import { queryCache } from '~/cache/api/queryCache';

export const getMessageFromMainDB = (messageId: string): Amity.InternalMessage | undefined => {
  const message = pullFromCache<Amity.InternalMessage>(['message', 'get', messageId])?.data;
  if (message) return message;

  const messages = queryCache<Amity.InternalMessage>(['message', 'get']);
  return messages?.find(({ data }) => data.messageId === messageId)?.data;
};
