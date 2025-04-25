import { ASCError } from '~/core/errors';
import { getActiveClient } from './activeClient';

export const enableUnreadCount = () => {
  const client = getActiveClient();

  client.log('client/api/isUnreadCountEnabled', client.isUnreadCountEnabled);

  if (!client) {
    throw new ASCError(
      'There is no active client',
      Amity.ClientError.UNKNOWN_ERROR,
      Amity.ErrorLevel.FATAL,
    );
  }

  if (client.isUnreadCountEnabled) return false;

  client.isUnreadCountEnabled = true;
  client.useLegacyUnreadCount = false;

  client.emitter.emit('unreadCountEnabled', true);

  return true;
};
