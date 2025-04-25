import { getActiveUser } from '~/client/api/activeUser';
import { getTotalChannelsUnread as _getTotalChannelsUnread } from '../internalApi/getTotalChannelsUnread';
import { onChannelUnreadUpdatedLocal } from '../events/onChannelUnreadUpdatedLocal';
import { ASCApiError, ASCError } from '~/core/errors';
import { getActiveClient } from '~/client';
import { convertGetterPropsToStatic } from '~/utils/object';
import { createQuery, runQuery } from '~/core/query';
import {
  UNSYNCED_OBJECT_CACHED_AT_MESSAGE,
  UNSYNCED_OBJECT_CACHED_AT_VALUE,
} from '~/utils/constants';
import { isEqual } from '~/utils/isEqual';

/* begin_public_function
  id: totalChannelsUnread.get
*/
/**
 * ```js
 * import { ChannelRepository } from '@amityco/ts-sdk';
 *
 * let totalChannelsUnread;
 *
 * const unsubscribe = ChannelRepository.getTotalChannelsUnread(response => {
 *   unread = response.data;
 * });
 * ```
 *
 * Observe all mutation on a given {@link Amity.UserUnread}
 *
 * @returns An {@link Amity.UserUnread} function to run when willing to stop observing the message
 *
 * @category User Unread Live Object
 *
 */

export const getTotalChannelsUnread = (
  callback: Amity.LiveObjectCallback<Amity.UserUnread | undefined>,
): Amity.Unsubscriber => {
  const { _id: userId } = getActiveUser();

  if (!userId)
    throw new ASCError(
      'The _id has not been defined in ActiveUser',
      Amity.ClientError.UNKNOWN_ERROR,
      Amity.ErrorLevel.ERROR,
    );

  const { log, cache } = getActiveClient();

  if (!cache) {
    console.log('For using Live Object feature you need to enable Cache!');
  }

  const timestamp = Date.now();
  log(`liveTotalChannelsUnread(tmpid: ${timestamp}) > listen`);

  const disposers: Amity.Unsubscriber[] = [];

  let isUnsyncedModel = false; // for messages

  let model: Amity.UserUnread | undefined;

  const dispatcher = (data: Amity.LiveObject<Amity.UserUnread | undefined>) => {
    const { data: userUnread } = data;

    const callbackModel = userUnread
      ? {
          unreadCount: userUnread.unreadCount,
          isMentioned: userUnread.isMentioned,
        }
      : undefined;

    model = callbackModel ? convertGetterPropsToStatic(callbackModel) : callbackModel;

    callback({
      data: callbackModel
        ? { ...callbackModel, isMentioned: callbackModel.isMentioned }
        : callbackModel,

      loading: data.loading,
      error: data.error,
    });
  };

  const realtimeRouter = (userUnread: Amity.UserUnread) => {
    if (isEqual(model, userUnread)) return;

    dispatcher({
      loading: false,
      data: userUnread,
    });
  };

  const onFetch = () => {
    const query = createQuery(async () => _getTotalChannelsUnread());

    runQuery(query, ({ error, data, loading, origin, cachedAt }) => {
      if (cachedAt === UNSYNCED_OBJECT_CACHED_AT_VALUE) {
        dispatcher({
          data,
          origin,
          loading: false,
          error: new ASCApiError(
            UNSYNCED_OBJECT_CACHED_AT_MESSAGE,
            Amity.ClientError.DISALOOW_UNSYNCED_OBJECT,
            Amity.ErrorLevel.ERROR,
          ),
        });

        isUnsyncedModel = true;
        disposers.forEach(fn => fn());
      } else if (!isUnsyncedModel) {
        dispatcher({ loading, data, origin, error });
      }

      if (error) {
        disposers.forEach(fn => fn());
      }
    });
  };

  disposers.push(onChannelUnreadUpdatedLocal(realtimeRouter));

  onFetch();

  return () => {
    disposers.forEach(fn => fn());
  };
};
