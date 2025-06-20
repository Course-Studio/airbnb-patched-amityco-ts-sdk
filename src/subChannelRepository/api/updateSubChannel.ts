import { ingestInCache } from '~/cache/api/ingestInCache';
import { getActiveClient } from '~/client/api';
import { fireEvent } from '~/core/events';
import { prepareSubChannelPayload } from '../utils';

/* begin_public_function
  id: subchannel.update
*/
/**
 * ```js
 * import { updateSubChannel } from '@amityco/ts-sdk'
 * const updated = await updateSubChannel(subChannelId, { name: 'foobar' })
 * ```
 *
 * Updates an {@link Amity.SubChannel}
 *
 * @param subChannelId The ID of the {@link Amity.SubChannel} to edit
 * @param patch The patch data to apply
 * @returns the updated {@link Amity.SubChannel} object
 *
 * @category Channel API
 * @async
 */
export const updateSubChannel = async (
  subChannelId: Amity.SubChannel['subChannelId'],
  patch: Patch<Amity.SubChannel, 'displayName'>,
): Promise<Amity.Cached<Amity.SubChannel>> => {
  const client = getActiveClient();
  client.log('channel/updateSubChannel', subChannelId, patch);

  const response = await client.http.put<Amity.SubChannelPayload>(
    `/api/v5/message-feeds/${encodeURIComponent(subChannelId)}`,
    { name: patch.displayName },
  );
  const data = await prepareSubChannelPayload(response.data);

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache(data, { cachedAt });

  fireEvent('message-feed.updated', response.data);

  return {
    data: data.messageFeeds[0],
    cachedAt,
  };
};
/* end_public_function */
