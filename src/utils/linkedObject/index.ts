import { storyLinkedObject } from '~/utils/linkedObject/storyLinkedObject';
import { streamLinkedObject } from '~/utils/linkedObject/streamLinkedObject';
import { categoryLinkedObject } from './categoryLinkedObject';
import { commentLinkedObject } from './commentLinkedObject';
import { userLinkedObject } from './userLinkedObject';
import { postLinkedObject } from './postLinkedObject';
import { messageLinkedObject } from './messageLinkedObject';
import { storyTargetLinkedObject } from './storyTargetLinkedObject';
import { reactorLinkedObject } from './reactorLinkedObject';
import { channelLinkedObject } from './channelLinkedObject';
import { adLinkedObject } from './adLinkedObject';
import { pinnedPostLinkedObject } from './pinnedPostLinkedObject';
import { notificationTrayLinkedObject } from './notificationTrayLinkedObject';

export const LinkedObject = {
  ad: adLinkedObject,
  comment: commentLinkedObject,
  post: postLinkedObject,
  user: userLinkedObject,
  category: categoryLinkedObject,
  stream: streamLinkedObject,
  story: storyLinkedObject,
  storyTarget: storyTargetLinkedObject,
  message: messageLinkedObject,
  reactor: reactorLinkedObject,
  channel: channelLinkedObject,
  pinnedPost: pinnedPostLinkedObject,
  notificationTray: notificationTrayLinkedObject,
};
