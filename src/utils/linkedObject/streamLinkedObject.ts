import { pullFromCache } from '~/cache/api';

export const streamLinkedObject = (stream: Amity.InternalStream): Amity.Stream => {
  return {
    ...stream,
    get moderation() {
      return pullFromCache<Amity.StreamModeration>(['streamModeration', 'get', stream.streamId])
        ?.data;
    },
    get post() {
      if (stream.referenceType !== 'post') return;
      return pullFromCache<Amity.Post>(['post', 'get', stream.referenceId])?.data;
    },
    get community() {
      if (stream.targetType !== 'community') return;
      return pullFromCache<Amity.Community>(['community', 'get', stream.targetId])?.data;
    },
    get user() {
      return pullFromCache<Amity.User>(['user', 'get', stream.userId])?.data;
    },
  };
};
