import { createLocalFollowEventSubscriber } from './utils';

export const onLocalUserUnfollowed = (
  callback: Amity.Listener<Amity.FollowStatus>,
): Amity.Unsubscriber => createLocalFollowEventSubscriber('local.follow.unfollowed', callback);
