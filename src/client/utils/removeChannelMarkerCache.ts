import { dropFromCache } from '~/cache/api/dropFromCache';
import { getResolver } from '~/core/model';

import { getActiveUser } from '../api/activeUser';

export const removeChannelMarkerCache = (channel: Amity.StaticInternalChannel) => {
  const id = getResolver('channelMarker')({
    userId: getActiveUser()._id,
    entityId: channel.channelId,
  });

  dropFromCache(['channelMarker', 'get', id], true);
};
