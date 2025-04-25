import { getActiveClient } from '~/client/api/activeClient';

export const syncEvent = async (events: Amity.AnalyticEventModel[]) => {
  const client = getActiveClient();
  const params: Record<string, any> = {
    activities: events,
  };

  await client.http.post<Amity.ChannelPayload>('/api/v1/analytics/activities', params);
};
