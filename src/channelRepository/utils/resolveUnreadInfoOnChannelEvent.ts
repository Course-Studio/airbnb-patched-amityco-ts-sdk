import { getActiveClient } from '~/client/api/activeClient';
import ObjectResolverEngine from '~/client/utils/ObjectResolver/objectResolverEngine';

export const resolveUnreadInfoOnChannelEvent = (channel: Amity.StaticInternalChannel) => {
  const client = getActiveClient();

  if (client.isUnreadCountEnabled && client.getMarkerSyncConsistentMode()) {
    const objectResolverEngine = ObjectResolverEngine.getInstance();

    objectResolverEngine.resolve(channel.channelId, Amity.ReferenceType.USER_MESSAGE_FEED_MARKER);
  }
};
