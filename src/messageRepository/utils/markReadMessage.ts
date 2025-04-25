import { getActiveClient } from '~/client/api/activeClient';
import ReadReceiptSyncEngine from '~/client/utils/ReadReceiptSync/readReceiptSyncEngine';
import LegacyReadReceiptSyncEngine from '~/client/utils/ReadReceiptSync/legacyReadReceiptSyncEngine';

export const markReadMessage = (message: Amity.InternalMessage) => {
  const client = getActiveClient();

  if (client.useLegacyUnreadCount) {
    const markReadReceiptEngine = ReadReceiptSyncEngine.getInstance();
    markReadReceiptEngine.markRead(message.channelId, message.channelSegment);
  } else {
    const markReadReceiptEngine = LegacyReadReceiptSyncEngine.getInstance();
    markReadReceiptEngine.markRead(message.subChannelId, message.channelSegment);
  }
};
