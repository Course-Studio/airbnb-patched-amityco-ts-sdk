import { ingestInCache } from '~/cache/api/ingestInCache';
import { getActiveClient } from '~/client/api/activeClient';
import { fireEvent } from '~/core/events';

export const getUserMarker = async (): Promise<Amity.Cached<Amity.UserMarker | undefined>> => {
  const client = getActiveClient();
  client.log('channel/getUserMarker');

  const { data: payload } = await client.http.get<Amity.UserMarkerPayload>(
    `/api/v1/markers/userMarker`,
  );

  const { userMarkers } = payload;

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache({ userMarkers }, { cachedAt });

  fireEvent('local.userMarker.fetched', { userMarkers });

  const latestUserMarker = userMarkers.reduce((maxUserMarker, userMarker) => {
    if (
      maxUserMarker == null ||
      new Date(maxUserMarker.lastSyncAt).getTime() < new Date(userMarker.lastSyncAt).getTime()
    ) {
      return userMarker;
    }

    return maxUserMarker;
  }, undefined as Amity.UserMarker | undefined);

  return { data: latestUserMarker, cachedAt };
};
