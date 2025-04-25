import { getActiveClient } from '~/client/api';
import { pushToTombstone } from '~/cache/api/pushToTombstone';
import { upsertInCache } from '~/cache/api';
import { fireEvent } from '~/core/events';
import { getFutureDate } from '~/core/model';
import { getSubChannel } from './getSubChannel';

/**
 * ```js
 * import { deleteSubChannel } from '~/subChannelRepository/api/deleteSubChannel'
 * const success = await deleteSubChannel('foobar')
 * ```
 *
 * Deletes a {@link Amity.SubChannel}
 *
 * @param subChannelId The {@link Amity.SubChannel} ID to delete
 * @return A the {@link Amity.SubChannel} was deleted
 *
 * @private
 * @async
 */
export const deleteSubChannel = async (
  subChannelId: Amity.SubChannel['subChannelId'],
  permanent = false,
): Promise<Amity.SubChannel> => {
  const client = getActiveClient();

  const subChannel = await getSubChannel(subChannelId);

  await client.http.delete<{ success: boolean }>(
    `/api/v5/message-feeds/${encodeURIComponent(subChannelId)}`,
    { params: { permanent } },
  );

  const deleted = {
    ...subChannel.data,
    isDeleted: true,
    updatedAt: getFutureDate(subChannel.data.updatedAt),
  };

  if (permanent) {
    setTimeout(() => {
      pushToTombstone('subChannel', subChannelId);
    }, 0);
  } else {
    upsertInCache(['subChannel', 'get', subChannelId], deleted);
  }

  fireEvent('local.message-feed.deleted', { messageFeeds: [deleted] });

  return deleted;
};
