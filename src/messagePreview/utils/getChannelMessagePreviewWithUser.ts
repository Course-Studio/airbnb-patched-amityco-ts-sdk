import { pullFromCache } from '~/cache/api';
import { getChannelMessagePreview } from './getChannelMessagePreview';
import { LinkedObject } from '~/utils/linkedObject';

export const getChannelMessagePreviewWithUser = (
  channel: Amity.StaticInternalChannel,
): Amity.StaticInternalChannel & {
  messagePreview: Amity.MessagePreview | null;
} => {
  const messagePreview = channel.messagePreviewId
    ? getChannelMessagePreview(channel.channelId)
    : null;

  const internalUser = pullFromCache<Amity.InternalUser>([
    'user',
    'get',
    messagePreview?.creatorId,
  ])?.data;

  const messagePreviewWithUser = messagePreview
    ? {
        ...messagePreview,
        user: internalUser ? LinkedObject.user(internalUser) : undefined,
      }
    : null;

  return { ...channel, messagePreview: messagePreviewWithUser };
};
