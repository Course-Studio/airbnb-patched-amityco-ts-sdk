import { onSessionStateChange } from '~/client/events/onSessionStateChange';
import ReadReceiptSyncEngine from '~/client/utils/ReadReceiptSync/readReceiptSyncEngine';

export default () => {
  const readReceiptSyncEngine = ReadReceiptSyncEngine.getInstance();
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
