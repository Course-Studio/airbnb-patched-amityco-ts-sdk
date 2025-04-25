import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { client, file12, createEmptyFormData, createFileFormData } from '~/utils/tests';

import { uploadFile } from '../uploadFile';

const videoToCreate = [file12];
const createIds = videoToCreate.map(({ fileId }) => fileId);
const resolvedPayloadValue = { data: videoToCreate };

describe('uploadFile', () => {
  test('it should return created file', async () => {
    const formData = createFileFormData();
    client.http.post = jest.fn().mockResolvedValue(resolvedPayloadValue);

    const received = uploadFile(formData);

    await expect(received).resolves.toEqual(expect.objectContaining({ data: videoToCreate }));
  });

  test('it should throw an error if request fails', async () => {
    const formData = createFileFormData();
    client.http.post = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(uploadFile(formData)).rejects.toThrow('error');
  });

  test('it should throw an error if formData is empty', async () => {
    const emptyFormData = createEmptyFormData();

    await expect(uploadFile(emptyFormData)).rejects.toThrow(
      'The formData object must have a `files` key.',
    );
  });

  test('it should call onProgress params on upload progress updated', async () => {
    expect.assertions(3);
    const formData = createFileFormData();
    const onProgress = jest.fn();

    jest.spyOn(client.http, 'post').mockImplementationOnce(
      (_, __, config) =>
        new Promise((resolve, _reject) => {
          config?.onUploadProgress?.({ loaded: 0, bytes: 0, total: 100 });
          config?.onUploadProgress?.({ loaded: 40, bytes: 40, total: 100 });
          config?.onUploadProgress?.({ loaded: 100, bytes: 100, total: 100 });
          resolve(resolvedPayloadValue);
        }),
    );

    await uploadFile(formData, onProgress);

    expect(onProgress).toHaveBeenNthCalledWith(1, 0);
    expect(onProgress).toHaveBeenNthCalledWith(2, 40);
    expect(onProgress).toHaveBeenNthCalledWith(3, 100);
  });

  test('it should create cache after created file', async () => {
    enableCache();
    const formData = createFileFormData();
    client.http.post = jest.fn().mockResolvedValue(resolvedPayloadValue);

    await uploadFile(formData);
    const received = createIds.map(id => pullFromCache(['file', 'get', id])?.data);

    expect(received).toEqual(expect.objectContaining(videoToCreate));

    disableCache();
  });
});
