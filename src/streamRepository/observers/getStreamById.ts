/* eslint-disable no-use-before-define */

import { liveObject } from '~/utils/liveObject';
import { getActiveClient } from '~/client';
import { pullFromCache } from '~/cache/api';
import { onStreamFlagged } from '~/streamRepository/events/onStreamFlagged';
import { onStreamTerminated } from '~/streamRepository/events/onStreamTerminated';
import { LinkedObject } from '~/utils/linkedObject';
import { getStream as _getStream } from '../internalApi/getStream';
import { onStreamRecorded, onStreamStarted, onStreamStopped } from '../events';

/* begin_public_function
  id: stream.get
*/
/**
 * ```js
 * import { StreamRepository } from '@amityco/ts-sdk'
 * const unsub = StreamRepository.getStreamById('foobar')
 * unsub()
 * ```
 *
 * Fetches a {@link Amity.Stream} object
 *
 * @param streamId the ID of the {@link Amity.Stream} to get
 * @param callback
 * @returns the associated {@link Amity.Stream} object
 *
 * @category Stream Live Object
 */

export const getStreamById = (
  streamId: Amity.Stream['streamId'],
  callback: Amity.LiveObjectCallback<Amity.Stream>,
): Amity.Unsubscriber => {
  const reactor: Amity.LiveObjectCallback<Amity.InternalStream> = (
    snapshot: Amity.LiveObject<Amity.InternalStream>,
  ) => {
    const { data } = snapshot;
    callback({ ...snapshot, data: data ? LinkedObject.stream(snapshot.data) : data });
  };

  return liveObject(streamId, reactor, 'streamId', _getStream, [
    onStreamRecorded,
    onStreamStarted,
    onStreamStopped,
    onStreamFlagged,
    onStreamTerminated,
  ]);
};
/* end_public_function */

/**
 * ```js
 * import { StreamRepository } from '@amityco/ts-sdk'
 * const stream = StreamRepository.getStreamById.locally('foobar')
 * ```
 *
 * Fetches a {@link Amity.Stream} live object
 *
 * @param streamId the ID of the {@link Amity.Stream} to fetch
 * @returns the associated {@link Amity.Stream} live object
 *
 * @category Stream API
 */
getStreamById.locally = (
  streamId: Amity.Stream['streamId'],
): Amity.Cached<Amity.Stream> | undefined => {
  const client = getActiveClient();
  client.log('stream/getStreamById', streamId);

  if (!client.cache) return;

  const cached = pullFromCache<Amity.InternalStream>(['stream', 'get', streamId]);

  if (!cached) return;

  return {
    data: LinkedObject.stream(cached.data),
    cachedAt: cached.cachedAt,
  };
};
