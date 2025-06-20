import { getActiveClient } from '~/client/api';

import { dropFromCache } from '~/cache/api';

/* begin_public_function
  id: file.delete
*/
/**
 * ```js
 * import { deleteFile } from '@amityco/ts-sdk'
 * const success = await deleteFile('foo')
 * ```
 *
 * Deletes a {@link Amity.File}
 *
 * @param fileId The {@link Amity.File} ID to delete
 * @return A success boolean if the {@link Amity.File} was deleted
 *
 * @category File API
 * @async
 */
export const deleteFile = async (
  fileId: Amity.File<any>['fileId'],
): Promise<{ success: boolean }> => {
  const client = getActiveClient();
  client.log('file/deleteFile', fileId);

  // API-FIX: payload is different than swagger docs!!
  await client.http.delete<{ fileId: string }>(`/api/v3/files/${fileId}`);

  dropFromCache(['file', 'get', fileId], true);

  return { success: true };
};
/* end_public_function */
