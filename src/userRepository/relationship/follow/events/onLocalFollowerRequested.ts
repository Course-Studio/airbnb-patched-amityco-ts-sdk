import { createLocalFollowEventSubscriber } from './utils';

export const onLocalFollowerRequested = (
  callback: Amity.Listener<Amity.FollowStatus>,
): Amity.Unsubscriber => createLocalFollowEventSubscriber('local.follow.requested', callback);
