import { queryCache } from '~/cache/api';
import { getChannelByIds } from '../internalApi/getChannelByIds';
import { fireEvent } from '~/core/events';

export const resolveChannels = async (channelIds: Amity.InternalChannel['channelPublicId'][]) => {
  await getChannelByIds(channelIds);
  const channels =
    queryCache<Amity.StaticInternalChannel>(['channel', 'get'])
      ?.filter(({ data }) => data.channelPublicId && channelIds.includes(data.channelPublicId))
      ?.map(({ data }) => data) ?? [];

  fireEvent('local.channel.resolved', channels);
};
