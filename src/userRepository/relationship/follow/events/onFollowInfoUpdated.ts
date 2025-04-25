import { createFollowEventSubscriber, createLocalFollowEventSubscriber } from './utils';
import { getFollowInfo } from '../api/getFollowInfo';

/**
 * ```js
 * import { onFollowInfoUpdated } from '@amityco/ts-sdk'
 * const dispose = onFollowInfoUpdated(followInfo => {
 *   // ...
 * })
 * ```
 *
 * Fired when a {@link Amity.FollowInfo} has been updated
 *
 * @param callback The function to call when the event was fired
 * @returns an {@link Amity.Unsubscriber} function to stop listening
 *
 * @category Follow Events
 */
export const onFollowInfoUpdated = (
  callback: Amity.Listener<Amity.FollowInfo>,
): Amity.Unsubscriber => {
  const handler = async (payload: Amity.FollowStatus) => {
    const [{ data: followInfoFrom }, { data: followInfoTo }] = await Promise.all([
      getFollowInfo(payload.from),
      getFollowInfo(payload.to),
    ]);

    callback(followInfoFrom);
    callback(followInfoTo);
  };

  const disposers = [
    createFollowEventSubscriber('follow.created', handler),
    createFollowEventSubscriber('follow.requested', handler),
    createFollowEventSubscriber('follow.accepted', handler),
    createFollowEventSubscriber('follow.unfollowed', handler),
    createFollowEventSubscriber('follow.requestCanceled', handler),
    createFollowEventSubscriber('follow.requestDeclined', handler),
    createFollowEventSubscriber('follow.followerDeleted', handler),
    createLocalFollowEventSubscriber('local.follow.created', handler),
    createLocalFollowEventSubscriber('local.follow.requested', handler),
    createLocalFollowEventSubscriber('local.follow.accepted', handler),
    createLocalFollowEventSubscriber('local.follow.unfollowed', handler),
    createLocalFollowEventSubscriber('local.follow.requestDeclined', handler),
  ];

  return () => {
    disposers.forEach(fn => fn());
  };
};
