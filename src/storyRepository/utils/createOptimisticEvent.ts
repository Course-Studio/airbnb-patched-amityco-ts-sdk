import { convertStoryPayloadToRaw } from '~/storyRepository/utils/convertStoryPayloadToRaw';
import { ingestInCache } from '~/cache/api/ingestInCache';

const saveOptimisticToCache = (payload: Amity.StoryCreatePayload) => {
  const optimisticData = convertStoryPayloadToRaw(payload);
  ingestInCache(optimisticData);
  return optimisticData;
};

export const createOptimisticEvent = (
  {
    payload,
    formData = undefined,
    isVideo = false,
  }: {
    payload: Amity.StoryCreatePayload;
    formData?: FormData;
    isVideo?: boolean;
  },
  callback: (optimisticData: Amity.StoryPayload) => void,
) => {
  if (formData) {
    const files = formData.getAll('files');
    const fileObject = files[0] || undefined;

    if (!fileObject) return;

    const fileData = new FileReader();

    fileData.readAsDataURL(fileObject as Blob);
    fileData.onload = () => {
      return callback(
        saveOptimisticToCache(
          isVideo
            ? {
                ...payload,
                data: {
                  ...payload.data,
                  fileId: undefined,
                  videoFileId: { original: undefined },
                  fileData: fileData?.result,
                },
              }
            : {
                ...payload,
                data: {
                  ...payload.data,
                  fileId: undefined,
                  fileData: fileData?.result,
                },
              },
        ),
      );
    };
  }

  return callback(
    saveOptimisticToCache({
      ...payload,
      data: {
        ...payload.data,
        fileData: null,
      },
    }),
  );
};
