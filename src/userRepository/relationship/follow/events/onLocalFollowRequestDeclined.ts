import { createLocalFollowEventSubscriber } from './utils';

export const onLocalFollowRequestDeclined = (
  callback: Amity.Listener<Amity.FollowStatus>,
): Amity.Unsubscriber => createLocalFollowEventSubscriber('local.follow.requestDeclined', callback);
