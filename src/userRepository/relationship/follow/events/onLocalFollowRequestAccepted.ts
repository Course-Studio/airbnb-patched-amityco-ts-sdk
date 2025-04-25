import { createLocalFollowEventSubscriber } from './utils';

export const onLocalFollowRequestAccepted = (
  callback: Amity.Listener<Amity.FollowStatus>,
): Amity.Unsubscriber => createLocalFollowEventSubscriber('local.follow.accepted', callback);
