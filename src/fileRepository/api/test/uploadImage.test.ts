import { disableCache, enableCache, pullFromCache } from '~/cache/api';
import { client, file11, createEmptyFormData, createFileFormData } from '~/utils/tests';

import { uploadImage } from '../uploadImage';

const imageToCreate = [file11];
const createIds = imageToCreate.map(({ fileId }) => fileId);
const resolvedPayloadValue = { data: imageToCreate };

describe('uploadImage', () => {
  test('should return created image', async () => {
    const formData = createFileFormData();
    client.http.post = jest.fn().mockResolvedValue(resolvedPayloadValue);

    const received = uploadImage(formData);

    await expect(received).resolves.toEqual(expect.objectContaining({ data: imageToCreate }));
  });

  test('should throw an error if request fails', async () => {
    const formData = createFileFormData();
    client.http.post = jest.fn().mockRejectedValueOnce(new Error('error'));

    await expect(uploadImage(formData)).rejects.toThrow('error');
  });

  test('should throw an error if formData is empty', async () => {
    const emptyFormData = createEmptyFormData();

    await expect(uploadImage(emptyFormData)).rejects.toThrow(
      'The formData object must have a `files` key.',
    );
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

    await uploadImage(formData, onProgress);

    expect(onProgress).toHaveBeenNthCalledWith(1, 0);
    expect(onProgress).toHaveBeenNthCalledWith(2, 40);
    expect(onProgress).toHaveBeenNthCalledWith(3, 100);
  });

  test('should create cache after created image', async () => {
    enableCache();
    const formData = createFileFormData();
    client.http.post = jest.fn().mockResolvedValue(resolvedPayloadValue);

    await uploadImage(formData);
    const received = createIds.map(id => pullFromCache(['file', 'get', id])?.data);

    expect(received).toEqual(expect.objectContaining(imageToCreate));

    disableCache();
  });
});
