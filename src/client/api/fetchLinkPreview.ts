import { getActiveClient } from './activeClient';

/**
 * ```js
 * import { fetchLinkPreview } from '@amityco/ts-sdk'
 * const { title, description, imageUrl } = fetchLinkPreview('https://www.example.com/')
 * ```
 *
 *
 * @param url the url to fetch link preview
 * @returns A {@link Amity.LinkPreview} instance
 *
 * @category Client API
 * */

export const fetchLinkPreview = async (url: string): Promise<Amity.LinkPreview> => {
  const client = getActiveClient();

  let fetchUrl = url;

  if (!/^https?:\/\//i.test(url)) {
    fetchUrl = `https://${url}`;
  }

  const { data } = await client.http.get<Amity.LinkPreview>(
    `/api/v1/link-preview?url=${encodeURIComponent(fetchUrl)}`,
  );

  return data;
};
