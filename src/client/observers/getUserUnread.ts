import { ASCApiError, ASCError } from '~/core/errors';
import { getUserMarker } from '~/marker/api';
import { onUserMarkerFetched } from '~/marker/events';

import { getActiveClient, getActiveUser } from '../api';
import { createQuery, runQuery } from '~/core/query';
import {
  UNSYNCED_OBJECT_CACHED_AT_MESSAGE,
  UNSYNCED_OBJECT_CACHED_AT_VALUE,
} from '~/utils/constants';

import { isEqual } from '~/utils/isEqual';
import { convertGetterPropsToStatic } from '~/utils/object';

/**
 *
 * ```js
 * import { getUserUnread } from '@amityco/ts-sdk';
 *
 * const unsubscribe = getUserUnread(response => {
 *   userUnread = response.data;
 * });
 * ```
 *
 * Observe current user's unread including unreadCount and hasMentioned from {@link Amity.UserMarker}
 *
 * @param callback the function to call when new data are available
 * @returns An {@link Amity.Unsubscriber} function to run when willing to stop observing the events
 *
 * @category Message Live Object
 */
export const getUserUnread = (
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
  log(`liveUserUnread(tmpid: ${timestamp}) > listen`);

  const disposers: Amity.Unsubscriber[] = [];

  let isUnsyncedModel = false; // for messages

  let model: Omit<Amity.UserUnread, 'hasMentioned'> | undefined;

  const dispatcher = (data: Amity.LiveObject<Amity.UserMarker | undefined>) => {
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

  const realtimeRouter = (userMarkers: Amity.UserMarker[]) => {
    const filterUserMarkers = userMarkers.filter(userMarker => userId === userMarker.userId);

    const latestUserMarker = filterUserMarkers.reduce((currentMaxUserMarker, userMarker) => {
      if (
        currentMaxUserMarker == null ||
        new Date(userMarker.lastSyncAt).getTime() >
          new Date(currentMaxUserMarker.lastSyncAt).getTime()
      ) {
        return userMarker;
      }
      return currentMaxUserMarker;
    }, null as Amity.UserMarker | null);

    const eventModel = {
      unreadCount: latestUserMarker?.unreadCount ?? 0,
      isMentioned: filterUserMarkers.some(userMarker => !!userMarker.isMentioned),
    } as Amity.UserMarker;

    if (isEqual(model, eventModel)) return;

    dispatcher({
      loading: false,
      data: eventModel,
    });
  };

  function isAmityUserMarkerData(data: unknown): data is Amity.UserMarker {
    /**
     * The `data` return from runQuery is Amity.UserMarker | undefined.
     * It's not located inside data field
     */
    if (data == null) return false;
    return (data as { data: Amity.UserMarker }) != null;
  }

  const onFetch = () => {
    const query = createQuery(getUserMarker);

    runQuery(query, ({ error, data, loading, origin, cachedAt }) => {
      if (!isAmityUserMarkerData(data)) {
        dispatcher({ loading, data: undefined, origin, error });
        return;
      }
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

  disposers.push(onUserMarkerFetched(userMarkers => realtimeRouter(userMarkers)));

  onFetch();

  return () => {
    disposers.forEach(fn => fn());
  };
};
