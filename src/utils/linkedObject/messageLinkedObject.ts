import { pullFromCache } from '~/cache/api';
import { getMessageReadCount } from '~/messageRepository/utils/getMessageReadCount';
import { markReadMessage } from '~/messageRepository/utils/markReadMessage';

export const messageLinkedObject = (message: Amity.InternalMessage): Amity.Message => {
  const { creatorPrivateId, ...rest } = message;
  return {
    ...rest,
    get readCount() {
      return getMessageReadCount(message).readCount;
    },
    get deliveredCount() {
      return getMessageReadCount(message).deliveredCount;
    },
    get creator() {
      return pullFromCache<Amity.InternalUser>(['user', 'get', message.creatorId])?.data;
    },
    markRead: () => markReadMessage(message),
  };
};
