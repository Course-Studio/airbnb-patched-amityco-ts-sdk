import { onSessionStateChange } from '~/client/events/onSessionStateChange';
import LegacyReadReceiptSyncEngine from '~/client/utils/ReadReceiptSync/legacyReadReceiptSyncEngine';

export default () => {
  const readReceiptSyncEngine = LegacyReadReceiptSyncEngine.getInstance();
  readReceiptSyncEngine.startSyncReadReceipt();

  onSessionStateChange(state => {
    if (state === Amity.SessionStates.ESTABLISHED) {
      readReceiptSyncEngine.onSessionEstablished();
    } else if (state === Amity.SessionStates.TOKEN_EXPIRED) {
      readReceiptSyncEngine.onTokenExpired();
    } else {
      readReceiptSyncEngine.onSessionDestroyed();
    }
  });

  return () => {
    readReceiptSyncEngine.onSessionDestroyed();
  };
};
