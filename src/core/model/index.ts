export * from './idResolvers';
export * from './identifyModel';

/**
 * A map of v3 response keys to a store name.
 * @hidden
 */
export const PAYLOAD2MODEL: Record<string, Amity.Domain> = {
  users: 'user',
  files: 'file',
  roles: 'role',
  stories: 'story',
  storyTargets: 'storyTarget',

  channels: 'channel',
  messageFeeds: 'subChannel',
  channelUsers: 'channelUsers',
  messages: 'message',

  messagePreviewChannel: 'messagePreviewChannel',
  messagePreviewSubChannel: 'messagePreviewSubChannel',

  channelUnreadInfo: 'channelUnreadInfo',
  subChannelUnreadInfo: 'subChannelUnreadInfo',

  userEntityMarkers: 'channelMarker',
  userFeedMarkers: 'subChannelMarker',
  contentMarkers: 'messageMarker',
  feedMarkers: 'feedMarker',
  userMarkers: 'userMarker',

  communities: 'community',
  categories: 'category',
  communityUsers: 'communityUsers',
  posts: 'post',
  postChildren: 'post',
  comments: 'comment',
  commentChildren: 'comment',
  polls: 'poll',
  reactors: 'reactor',
  reactions: 'reaction',

  videoStreamings: 'stream',
  videoStreamModerations: 'streamModeration',

  follows: 'follow',
  followCounts: 'followCount',

  feeds: 'feed',
  ads: 'ad',
  advertisers: 'advertiser',

  pinTargets: 'pinTarget',
  pins: 'pin',

  notificationTrayItems: 'notificationTrayItem',
};

/** hidden */
export const isOutdated = <T extends Amity.UpdatedAt>(prevData: T, nextData: T): boolean => {
  if ('updatedAt' in nextData && 'updatedAt' in nextData) {
    return new Date(nextData.updatedAt!) < new Date(prevData.updatedAt!);
  }

  return false;
};

/** hidden */
export function getFutureDate(date: string | undefined = new Date().toISOString()): string {
  return new Date(new Date(date).getTime() + 1).toISOString();
}

/** hidden */
export function getPastDate(date: string | undefined = new Date().toISOString()): string {
  return new Date(new Date(date).getTime() - 1).toISOString();
}
