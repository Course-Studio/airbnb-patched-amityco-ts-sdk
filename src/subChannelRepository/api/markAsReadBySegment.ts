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

export const markAsReadBySegment = async ({
  subChannelId,
  readToSegment,
}: {
  subChannelId: Amity.SubChannel['subChannelId'];
  readToSegment: number;
}): Promise<boolean> => {
  const client = getActiveClient();
  client.log('subChannel/markAsReadBySegment', subChannelId);

  try {
    await client.http.put<Amity.MarkAsReadPayload>(
      `/api/v1/markers/message-feeds/${subChannelId}/mark-read`,
      { readToSegment },
    );

    return true;
  } catch (e) {
    return false;
  }
};
