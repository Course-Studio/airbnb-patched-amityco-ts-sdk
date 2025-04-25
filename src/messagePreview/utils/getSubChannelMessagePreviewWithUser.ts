import { pullFromCache } from '~/cache/api';
import { getSubChannelMessagePreview } from './getSubChannelMessagePreview';

export const getSubChannelMessagePreviewWithUser = (subChannel: Amity.SubChannel) => {
  const messagePreview = subChannel.messagePreviewId
    ? getSubChannelMessagePreview(subChannel.subChannelId)
    : null;

  const messagePreviewWithUser = messagePreview
    ? {
        ...messagePreview,
        user: pullFromCache<Amity.InternalUser>(['user', 'get', messagePreview?.creatorId])?.data,
      }
    : null;

  return { ...subChannel, messagePreview: messagePreviewWithUser };
};
