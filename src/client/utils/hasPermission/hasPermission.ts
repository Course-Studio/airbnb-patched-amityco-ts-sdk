import { getActiveClient } from '~/client/api/activeClient';
import { checkCommunityPermission } from '~/client/utils/hasPermission/checkCommunityPermission';
import { checkChannelPermission } from '~/client/utils/hasPermission/checkChannelPermission';
import { checkUserPermission } from '~/client/utils/hasPermission/checkUserPermission';

export const hasPermission = (permission: string) => {
  const { userId } = getActiveClient();

  return {
    currentUser: () => checkUserPermission(userId, permission),

    community: (communityId: Amity.Community['communityId']) =>
      checkCommunityPermission(userId, permission, communityId),

    channel: (channelId: Amity.Channel['channelId']) =>
      checkChannelPermission(userId, permission, channelId),
  };
};
