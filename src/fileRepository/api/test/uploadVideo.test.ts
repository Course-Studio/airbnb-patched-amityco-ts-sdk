import { ContentFeedType } from '~/@types';
import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { client, file12, createEmptyFormData, createFileFormData } from '~/utils/tests';

import { uploadVideo } from '../uploadVideo';

const videoToCreate = [file12];
const createIds = videoToCreate.map(({ fileId }) => fileId);
const resolvedPayloadValue = { data: videoToCreate };

describe('uploadVideo', () => {
  test('should return created video', async () => {
    const formData = createFileFormData();
    client.http.post = jest.fn().mockResolvedValue(resolvedPayloadValue);

    const received = uploadVideo(formData);

    await expect(received).resolves.toEqual(expect.objectContaining({ data: videoToCreate }));
  });

  test('should throw an error if request fails', async () => {
    const formData = createFileFormData();
    client.http.post = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(uploadVideo(formData)).rejects.toThrow('error');
  });

  test('should throw an error if formData is empty', async () => {
    const emptyFormData = createEmptyFormData();

    await expect(uploadVideo(emptyFormData)).rejects.toThrow(
      'The formData object must have a `files` key.',
    );
  });

  // There is currently no polyfill or native API for generating complete formData
  // in Node.js, so I'll skip this until 100% browser-compatible formData can be created.
  test.skip('should append feedType to formData when define feedType param', async () => {
    const formData = createFileFormData();
    client.http.post = jest.fn().mockResolvedValue(resolvedPayloadValue);

    await uploadVideo(formData, ContentFeedType.POST);

    expect(formData.get('feedType')).toEqual(ContentFeedType.POST);
  });

  test('should call onProgress params on upload progress updated', async () => {
    expect.assertions(3);
    const formData = createFileFormData();
    const onProgress = jest.fn();

    jest.spyOn(client.http, 'post').mockImplementationOnce(
      (url, data, config) =>
        new Promise((resolve, _reject) => {
          config?.onUploadProgress?.({ loaded: 0, bytes: 0, total: 100 });
          config?.onUploadProgress?.({ loaded: 40, bytes: 40, total: 100 });
          config?.onUploadProgress?.({ loaded: 100, bytes: 100, total: 100 });
          resolve(resolvedPayloadValue);
        }),
    );

    await uploadVideo(formData, undefined, onProgress);

    expect(onProgress).toHaveBeenNthCalledWith(1, 0);
    expect(onProgress).toHaveBeenNthCalledWith(2, 40);
    expect(onProgress).toHaveBeenNthCalledWith(3, 100);
  });

  test('should create cache after created video', async () => {
    enableCache();
    const formData = createFileFormData();
    client.http.post = jest.fn().mockResolvedValue(resolvedPayloadValue);

    await uploadVideo(formData);
    const received = createIds.map(id => pullFromCache(['file', 'get', id])?.data);

    expect(received).toEqual(expect.objectContaining(videoToCreate));

    disableCache();
  });
});
