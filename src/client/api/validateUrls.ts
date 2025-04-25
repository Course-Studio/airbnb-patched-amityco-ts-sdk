import { getActiveClient } from './activeClient';

/**
 * Validate a list of urls
 * @param urls  array of strings to validate (max 10 items)
 *
 * @category Client API
 */
export const validateUrls = async (urls: string[]): Promise<boolean> => {
  const client = getActiveClient();
  client.log('channel/markerSync');

  if (urls.length === 0) return false;

  const { data: payload } = await client.http.post<{ success: boolean }>(
    '/api/v3/allowlists/verify',
    {
      data: urls,
    },
  );

  return payload.success;
};
