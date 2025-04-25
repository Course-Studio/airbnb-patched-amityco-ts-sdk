import { getActiveClient } from '~/client/api';

import { ingestInCache } from '~/cache/api/ingestInCache';
import GlobalFileAccessType from '~/client/utils/GlobalFileAccessType';

/* begin_public_function
  id: file.upload.video, file.upload.audio
*/
/**
 * ```js
 * import { FileRepository } from '@amityco/ts-sdk'
 * const created = await FileRepository.uploadVideo(formData)
 * ```
 *
 * Creates an {@link Amity.File<'video'>}
 *
 * @param formData The data necessary to create a new {@link Amity.File<'video'>}
 * @param feedType The {@link Amity.File<'video'>} feed type
 * @param onProgress The callback to track the upload progress
 * @returns The newly uploaded {@link Amity.File<'video'>}
 *
 * @category File API
 * @async
 */
export const uploadVideo = async (
  formData: FormData,
  feedType?: Amity.ContentFeedType,
  onProgress?: (percent: number) => void,
): Promise<Amity.Cached<Amity.File<'video'>[]>> => {
  const client = getActiveClient();
  client.log('file/uploadVideo', formData);

  const files = formData.getAll('files');

  if (!files.length) throw new Error('The formData object must have a `files` key.');

  const accessType = GlobalFileAccessType.getInstance().getFileAccessType();
  formData.append('accessType', accessType);

  formData.append('preferredFilename', (files[0] as File).name);

  if (feedType) {
    formData.append('feedType', feedType);
  }

  const headers =
    'getHeaders' in formData
      ? (formData as any).getHeaders()
      : { 'content-type': 'multipart/form-data' };

  const { data } = await client.upload.post<Amity.CreateFilePayload<'video'>>(
    '/api/v4/videos',
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
