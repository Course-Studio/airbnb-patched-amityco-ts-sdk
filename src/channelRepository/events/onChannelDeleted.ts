import { createEventSubscriber } from '~/core/events';

import { getActiveClient } from '~/client/api/activeClient';
import { ingestInCache } from '~/cache/api/ingestInCache';

import { prepareChannelPayload } from '../utils/prepareChannelPayload';
import { addFlagIsDeletedSubChannelUnreadByChannelId } from '~/marker/utils/addFlagIsDeletedSubChannelUnreadByChannelId';
import { deleteChannelUnreadByChannelId } from '../../marker/utils/deleteChannelUnreadByChannelId';
import { dropFromCache, pullFromCache, pushToCache } from '~/cache/api';

type CallbackFn = (channel: Amity.StaticInternalChannel) => void;
const callbacks: CallbackFn[] = [];
let mainDisposer: (() => void) | null = null;

const dispose = (cb: CallbackFn) => {
  const index = callbacks.indexOf(cb);
  if (index > -1) {
    callbacks.splice(index, 1);
  }
  if (callbacks.length === 0) {
    mainDisposer?.();
  }
};

export const onChannelDeleted = (callback: Amity.Listener<Amity.StaticInternalChannel>) => {
  if (callbacks.length === 0) {
    const client = getActiveClient();

    const filter = async (payload: Amity.ChannelPayload) => {
      const data = await prepareChannelPayload(payload);

      const isConsistentMode = client.getMarkerSyncConsistentMode() && client.isUnreadCountEnabled;
      const isLegacyUnreadCount = client.useLegacyUnreadCount;

      data.channels.forEach(channel => {
        if (isConsistentMode) {
          addFlagIsDeletedSubChannelUnreadByChannelId(channel.channelId);
          deleteChannelUnreadByChannelId(channel.channelId);
        } else if (isLegacyUnreadCount) {
          const cacheKey = ['channelUnread', 'get', channel.channelId];
          const cache = pullFromCache<Amity.ChannelUnread>(cacheKey);
          if (cache) {
            pushToCache(cacheKey, {
              ...cache,
              isDeleted: true,
            });
          }
        }
      });

      ingestInCache(data);
      callbacks.forEach(cb => cb(data.channels[0]));
    };

    mainDisposer = createEventSubscriber(client, 'onChannelDeleted', 'channel.deleted', filter);
  }

  callbacks.push(callback);
  return () => dispose(callback);
};
