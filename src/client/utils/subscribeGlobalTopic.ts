import { getActiveUser } from '~/client/api/activeUser';
import {
  getMarkerUserFeedTopic,
  getNetworkTopic,
  getSmartFeedChannelTopic,
  getSmartFeedMessageTopic,
  getSmartFeedSubChannelTopic,
  getUserTopic,
  subscribeTopic,
  getLiveStreamTopic,
} from '~/core/subscription';

export const subscribeGlobalTopic = () => {
  const disposers: Amity.Unsubscriber[] = [
    subscribeTopic(getNetworkTopic()),
    subscribeTopic(getSmartFeedChannelTopic()),
    subscribeTopic(getSmartFeedSubChannelTopic()),
    subscribeTopic(getSmartFeedMessageTopic()),

    // subscribing to user topic is necessary to handle ban event
    subscribeTopic(getUserTopic(getActiveUser())),
    subscribeTopic(getMarkerUserFeedTopic()),

    subscribeTopic(getLiveStreamTopic()),
  ];

  return () => disposers.forEach(fn => fn());
};
