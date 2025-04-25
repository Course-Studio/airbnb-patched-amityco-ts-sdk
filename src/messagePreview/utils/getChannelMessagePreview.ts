import { pullFromCache } from '~/cache/api';

export const getChannelMessagePreview = (channelId: string) => {
  return (
    pullFromCache<Amity.InternalMessagePreview>(['messagePreviewChannel', 'get', channelId])
      ?.data ?? null
  );
};
