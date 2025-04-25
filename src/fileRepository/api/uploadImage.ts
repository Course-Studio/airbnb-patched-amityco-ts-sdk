import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import GlobalFileAccessType from '~/client/utils/GlobalFileAccessType';

/* begin_public_function
  id: file.upload.image
*/
/**
 * ```js
 * import { FileRepository } from '@amityco/ts-sdk'
 * const created = await FileRepository.uploadImage(formData)
 * ```
 *
 * Creates an {@link Amity.File<'image'>}
 *
 * @param formData The data necessary to create a new {@link Amity.File<'image'>}
 * @param onProgress The callback to track the upload progress
 * @returns The newly created {@link Amity.File<'image'>}
 *
 * @category File API
 * @async
 */
export const uploadImage = async (
  formData: FormData,
  onProgress?: (percent: number) => void,
): Promise<Amity.Cached<Amity.File<'image'>[]>> => {
  const client = getActiveClient();
  client.log('file/uploadImage', formData);

  const files = formData.getAll('files');

  if (!files.length) throw new Error('The formData object must have a `files` key.');

  const accessType = GlobalFileAccessType.getInstance().getFileAccessType();
  formData.append('accessType', accessType);

  formData.append('preferredFilename', (files[0] as File).name);

  const headers =
    'getHeaders' in formData
      ? (formData as any).getHeaders()
      : { 'content-type': 'multipart/form-data' };

  const { data } = await client.upload.post<Amity.CreateFilePayload<'image'>>(
    '/api/v4/images',
    formData,
    {
      headers,
      onUploadProgress({ loaded, total = 100 }) {
        onProgress && onProgress(Math.round((loaded * 100) / total));
      },
    },
  );

  // API-FIX: payload should be serialized properly
  // const { files } = data

  const cachedAt = client.cache && Date.now();
  if (client.cache) ingestInCache({ files: data }, { cachedAt });

  return {
    data,
    cachedAt,
  };
};
/* end_public_function */
