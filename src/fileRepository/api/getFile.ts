import { getActiveClient } from '~/client/api';

import { pullFromCache } from '~/cache/api';
import { ingestInCache } from '~/cache/api/ingestInCache';

/* begin_public_function
  id: file.get
*/
/**
 * ```js
 * import { getFile } from '@amityco/ts-sdk'
 * const file = await getFile('foo')
 * ```
 *
 * Fetches a {@link Amity.File} object
 *
 * @param fileId the ID of the {@link Amity.File} to fetch
 * @returns the associated {@link Amity.File} object
 *
 * @category File API
 * @async
 */
export const getFile = async <T extends Amity.FileType = any>(
  fileId: Amity.File<any>['fileId'],
): Promise<Amity.Cached<Amity.File>> => {
  const client = getActiveClient();
  client.log('file/getFile', fileId);

  const { data } = await client.http.get<Amity.FilePayload<T>>(`/api/v3/files/${fileId}`);

  // API-FIX: backend bad serializer issue. it should be:
  // const { files } = data

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache({ files: [data] }, { cachedAt });

  return {
    data,
    cachedAt,
  };
};
/* end_public_function */

/**
 * ```js
 * import { getFile } from '@amityco/ts-sdk'
 * const file = getFile.locally('foo')
 * ```
 *
 * Fetches a {@link Amity.File} object from cache
 *
 * @param fileId the ID of the {@link Amity.File} to fetch
 * @returns the associated {@link Amity.File} object
 *
 * @category File API
 */
getFile.locally = (fileId: Amity.File<any>['fileId']): Amity.Cached<Amity.File> | undefined => {
  const client = getActiveClient();
  client.log('file/getFile.locally', fileId);

  if (!client.cache) return;

  const cached = pullFromCache<Amity.File>(['file', 'get', fileId]);

  if (!cached) return;

  return {
    data: cached.data,
    cachedAt: cached.cachedAt,
  };
};
