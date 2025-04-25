import { convertRawUserToInternalUser } from '~/userRepository/utils/convertRawUserToInternalUser';

export const prepareNotificationTrayItemsPayload = (
  rawPayload: Amity.NotificationTrayPayload,
): Amity.ProcessedNotificationTrayPayload => {
  const users = rawPayload.users.map(convertRawUserToInternalUser);

  return {
    ...rawPayload,
    users,
  };
};
