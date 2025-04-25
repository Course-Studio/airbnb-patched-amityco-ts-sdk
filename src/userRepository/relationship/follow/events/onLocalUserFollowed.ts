import { createLocalFollowEventSubscriber } from './utils';

export const onLocalUserFollowed = (
  callback: Amity.Listener<Amity.FollowStatus>,
): Amity.Unsubscriber => createLocalFollowEventSubscriber('local.follow.created', callback);
