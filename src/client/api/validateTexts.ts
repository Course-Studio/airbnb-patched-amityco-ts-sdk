import { getActiveClient } from './activeClient';

/**
 * Validate a list of texts
 * @param texts array of strings to validate (max 10 items)
 *
 * @category Client API
 */
export const validateTexts = async (texts: string[]): Promise<boolean> => {
  const client = getActiveClient();
  client.log('channel/markerSync');

  if (texts.length === 0) return false;

  const { data: payload } = await client.http.post<{ success: boolean }>(
    '/api/v3/blocklists/verify',
    {
      data: texts,
    },
  );

  return payload.success;
};
