import { getActiveClient } from '~/client/api';
import {
  LIVE_OBJECT_ENABLE_CACHE_MESSAGE,
  UNSYNCED_OBJECT_CACHED_AT_MESSAGE,
  UNSYNCED_OBJECT_CACHED_AT_VALUE,
} from '~/utils/constants';
import { createQuery, runQuery } from '~/core/query';
import { ASCApiError } from '~/core/errors';
import { convertGetterPropsToStatic } from '~/utils/object';

import { isEqual } from './isEqual';

/**
 * @deprecated This function will to be deprecated soon.
 */
export const liveObject = <
  T extends Amity.Model,
  K extends keyof T,
  CallbackData extends any = any,
>(
  id: T[K],
  callback: Amity.LiveObjectCallback<CallbackData>,
  key: K,
  fetcher: (id: T[K]) => Promise<Amity.Cached<T>>,
  eventHandlers: Array<(callback: Amity.Listener<T>) => Amity.Unsubscriber>,
  options?: Amity.LiveObjectOptions<T, CallbackData>,
): Amity.Unsubscriber => {
  const { forceDispatch, callbackDataSelector, callbackFilter } = {
    forceDispatch: false,
    callbackDataSelector: (data: T) => data as unknown as CallbackData,
    ...options,
  };

  const { cache } = getActiveClient();

  if (!cache) {
    console.log(LIVE_OBJECT_ENABLE_CACHE_MESSAGE);
  }

  let model: T;
  let isUnsyncedModel = false; // for messages
  const disposers: Amity.Unsubscriber[] = [];

  const dispatcher = (data: Amity.LiveObject<T>) => {
    const { data: newModel, ...rest } = data;

    if (!callbackFilter || callbackFilter(newModel, model)) {
      callback({ data: callbackDataSelector(newModel), ...rest });
    }

    // resolve all getter on data model to a static value to avoid comparison problems
    model = convertGetterPropsToStatic(newModel);
  };

  const realtimeRouter = (eventModel: T, forceDispatch = false) => {
    if (id !== eventModel[key]) {
      return;
    }

    if (model) {
      if (!forceDispatch && isEqual(model, eventModel)) {
        return;
      }
    }

    dispatcher({ loading: false, data: eventModel, origin: 'event' });
  };

  const onFetch = () => {
    // TODO: Ihis `@ts-ignore` is bring back to fix the build and it needs to be removed later
    // @ts-ignore
    const query = createQuery(fetcher, id, true);

    runQuery(query, ({ error, data, loading, origin, cachedAt }) => {
      if (cachedAt === UNSYNCED_OBJECT_CACHED_AT_VALUE) {
        dispatcher({
          // @ts-ignore
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
        // @ts-ignore
        dispatcher({ loading, data, origin, error });
      }

      if (error) {
        disposers.forEach(fn => fn());
      }
    });
  };

  disposers.push(
    ...eventHandlers.map(fn => fn(eventModel => realtimeRouter(eventModel, forceDispatch))),
  );

  onFetch();

  return () => {
    disposers.forEach(fn => fn());
  };
};
