import { uuid } from '~/core/uuid';
import { fireEvent } from '~/core/events';
import { getActiveClient, getActiveUser } from '~/client/api';
import { ingestInCache } from '~/cache/api/ingestInCache';
import { UNSYNCED_OBJECT_CACHED_AT_VALUE } from '~/utils/constants';
import { dropFromCache, pullFromCache, pushToCache, upsertInCache } from '~/cache/api';

import { LinkedObject } from '~/utils/linkedObject';
import { convertParams, prepareMessagePayload } from '../utils';

const getLocalId = () => `LOCAL_${uuid()}`;

// FIXME: temp solution
let uniqueId: string | undefined;

/* begin_public_function
  id: message.create.text_message, message.create.image_message, message.create.file_message, message.create.video_message, message.create.audio_message, message.create.custom_message
*/

type createMessageParam<T extends Amity.MessageContentType> = Pick<
  Amity.Message<T>,
  'subChannelId' | 'parentId' | 'dataType' | 'tags' | 'metadata' | 'mentionees'
> & {
  data?: Amity.Message<T>['data'];
  fileId?: Amity.File['fileId'];
  referenceId?: string;
};

const createMessageOptimistic = <T extends Amity.MessageContentType>(
  bundle: createMessageParam<T>,
): Amity.InternalMessage | undefined => {
  const client = getActiveClient();

  if (!client.cache) return;

  /*
   * When creating messages optimistically a messageId needs to be added by the
   * client, created a new variable to allow backward compatibility of API
   *
   * Updated to handle client requirement to add messageId while uploading
   * a message with image.
   * Temporary!
   */
  uniqueId = bundle.referenceId || getLocalId();
  const bundleWithMessageId = { messageId: uniqueId, uniqueId, ...bundle };

  client.log('message/createMessage.optimistically', bundleWithMessageId);

  const subChannel = pullFromCache<Amity.SubChannel>(['subChannel', 'get', bundle.subChannelId]);

  if (subChannel) {
    upsertInCache(['subChannel', 'get', bundle.subChannelId], {
      ...subChannel.data,
      messageCount: subChannel.data.messageCount + 1,
    });

    if (subChannel.data.channelId === subChannel.data.subChannelId) {
      const channel = pullFromCache<Amity.StaticInternalChannel>([
        'channel',
        'get',
        subChannel.data.channelId,
      ]);

      if (channel?.data) {
        upsertInCache(['channel', 'get', subChannel.data.channelId], {
          ...channel.data,
          messageCount: (channel.data.messageCount ?? 0) + 1,
        });
      }
    }
  }

  // as reused to update created and updated time, which should be the same
  const createdTime = new Date().toISOString();

  const message = {
    creatorId: client.userId!,
    creatorPrivateId: getActiveUser()._id,
    channelSegment: (subChannel?.data.messageCount ?? 0) + 1,
    childrenNumber: 0,
    createdAt: createdTime,
    updatedAt: createdTime,
    syncState: Amity.SyncState.Syncing,
    isDeleted: false,
    ...bundleWithMessageId,
  } as Amity.InternalMessage;

  const cachedAt = UNSYNCED_OBJECT_CACHED_AT_VALUE;

  pushToCache(['message', 'get', message.messageId], message, { cachedAt });

  fireEvent('local.message.created', { messages: [message] });

  return message;
};
/**
 * ```js
 * import { createMessage, createQuery, runQuery } from '@amityco/ts-sdk'
 *
 * const query = createQuery(createMessage, {
 *   subChannelId: 'foobar',
 *   data: { text: 'hello world' },
 * });
 *
 * runQuery(query, ({ data: message, loading }) => {
 *   console.log(message);
 * });
 * ```
 *
 * Creates an {@link Amity.Message}
 *
 * @param bundle The data necessary to create a new {@link Amity.Message}
 * @returns The newly created {@link Amity.Message}
 *
 * @category Message API
 * @async
 */
export const createMessage = async <T extends Amity.MessageContentType>(
  bundle: createMessageParam<T>,
): Promise<Amity.Cached<Amity.Message>> => {
  const client = getActiveClient();

  client.log('message/createMessage', bundle);

  const optimisticData = createMessageOptimistic<T>(bundle);

  const referenceId = bundle.referenceId || uniqueId || getLocalId();
  uniqueId = undefined;

  try {
    const { data: payload } = await client.http.post<Amity.MessagePayload>('/api/v5/messages', {
      ...convertParams(bundle),
      referenceId,
    });

    const data = await prepareMessagePayload(payload);
    const { messages } = data;

    const cachedAt = client.cache && Date.now();
    if (client.cache) {
      ingestInCache(data, { cachedAt });
    }

    fireEvent('local.message.created', {
      messages: [{ ...messages[0], syncState: Amity.SyncState.Synced }],
    });

    return {
      data: LinkedObject.message(messages[0]),
      cachedAt,
    };
  } catch (e) {
    fireEvent('local.message.created', {
      messages: [{ ...optimisticData, syncState: Amity.SyncState.Error } as Amity.InternalMessage],
    });

    throw e;
  }
};
/* end_public_function */
