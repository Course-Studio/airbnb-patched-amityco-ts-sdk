import { getActiveClient } from '~/client/api/activeClient';

import { ingestInCache } from '~/cache/api/ingestInCache';

import { prepareChannelPayload } from '../../utils';

const MUTE_FOREVER = -1;

/* begin_public_function
  id: channel.moderation.mute_members
*/
/**
 * ```js
 * import { muteMembers } from '@amityco/ts-sdk'
 *
 * await muteMembers('channel-id-1', ['userId1', 'userId2'], 10)
 * ```
 *
 * @param channelId of {@link Amity.Channel} from which the users should be muted
 * @param userIds of the {@link Amity.InternalUser}'s to be muted
 * @param period to be muted in seconds
 * @returns the updated {@link Amity.Membership}'s object
 *
 * @category Channel API
 * @async
 * */
export const muteMembers = async (
  channelId: Amity.Channel['channelId'],
  userIds: Amity.InternalUser['userId'][],
  mutePeriod = MUTE_FOREVER,
): Promise<boolean> => {
  const client = getActiveClient();
  client.log('channel/muteMembers', { userIds, channelId, mutePeriod });

  const { data } = await client.http.put<{ success: boolean }>(
    `/api/v2/channel/${channelId}/users/mute`,
    {
      userIds,
      mutePeriod: mutePeriod === MUTE_FOREVER ? mutePeriod : mutePeriod * 1000,
    },
  );

  const { success } = data;

  return success;
};
/* end_public_function */
