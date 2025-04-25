import NetworkActivitiesWatcher from '~/client/utils/NetworkActivitiesWatcher';

/**
 *
 * Fired when any {@link Amity.Client} has a session state change
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Client Events
 */
export const onNetworkActivities = (
  callback: (
    request: Request,
    response: {
      data: unknown;
      status: number;
      statusText: string;
      headers: Headers;
    },
  ) => void,
): Amity.Unsubscriber => NetworkActivitiesWatcher.getInstance().onNetworkActivities(callback);
