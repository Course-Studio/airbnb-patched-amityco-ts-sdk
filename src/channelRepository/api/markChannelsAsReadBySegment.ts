import { getActiveClient } from '~/client/api/activeClient';

/**
 *
 * Mark subChannel as read by readToSegment
 *
 * @param subChannelIds the IDs of the {@link Amity.SubChannel} to update
 * @param readToSegment the segment to mark as read
 * @returns a success boolean if the {@link Amity.SubChannel} was updated
 *
 * @category Channel API
 * @async
 */

export const markChannelsAsReadBySegment = async (
  readings: {
    channelId: Amity.Channel['channelId'];
    readToSegment: number;
  }[],
): Promise<boolean> => {
  const client = getActiveClient();

  try {
    await client.http.post<Amity.MarkAsReadPayload>('api/v3/channels/seen', { channels: readings });
    return true;
  } catch (e) {
    return false;
  }
};
