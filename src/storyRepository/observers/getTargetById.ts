import { liveObject } from '~/utils/liveObject';
import { getTargetsByTargetIds } from '~/storyRepository/internalApi/getTargetsByTargetIds';
import { LinkedObject } from '~/utils/linkedObject';

export const getTargetById = (
  params: Amity.StoryTargetLiveObjectParam['query'],
  callback: Amity.LiveObjectCallback<Amity.StoryTarget>,
): Amity.Unsubscriber => {
  return liveObject(
    // @TODO: Now I put @ts-ignore here because I don't know how to fix this, it always say that params is not assignable to `NEVER`
    // @ts-ignore
    params,
    result => {
      if (!result?.data) {
        callback(result);
        return;
      }

      callback({
        ...result,
        data: LinkedObject.storyTarget(result.data[0]),
      });
    },
    'query',
    param => {
      return getTargetsByTargetIds([param]);
    },
    [],
  );
};
