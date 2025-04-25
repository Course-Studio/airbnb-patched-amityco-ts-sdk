import { pullFromCache } from '~/cache/api';

export const getSubChannelMessagePreview = (subChannelId: string) => {
  return (
    pullFromCache<Amity.InternalMessagePreview>(['messagePreviewSubChannel', 'get', subChannelId])
      ?.data ?? null
  );
};
