import { activeUser } from '../client';
import { date } from '.';

export const generateChannelMarker = ({
  entityId,
  ...params
}: MakeRequired<Amity.ChannelMarker, 'entityId'>): Amity.ChannelMarker => ({
  entityId,
  userId: activeUser.userId,
  unreadCount: 0,
  isDeleted: false,
  createdAt: date,
  updatedAt: date,
  hasMentioned: false,
  ...params,
});

export const generateChannelMarkerResponse = ({
  entityId,
  ...params
}: MakeRequired<Amity.ChannelMarker, 'entityId'>): Amity.UserEntityMarkerResponse => ({
  entityId,
  userId: activeUser.userId,
  unreadCount: 0,
  isDeleted: false,
  createdAt: date,
  updatedAt: date,
  isMentioned: false,
  ...params,
});

export const generateSubChannelMarker = ({
  feedId,
  entityId,
  ...params
}: MakeRequired<Amity.SubChannelMarker, 'feedId' | 'entityId'>): Amity.SubChannelMarker => ({
  feedId,
  entityId,
  userId: activeUser.userId,
  readToSegment: 0,
  deliveredToSegment: 0,
  unreadCount: 0,
  createdAt: date,
  updatedAt: date,
  hasMentioned: false,
  ...params,
});

export const generateSubChannelMarkerResponse = ({
  feedId,
  entityId,
  ...params
}: MakeRequired<Amity.SubChannelMarker, 'feedId' | 'entityId'>): Amity.UserFeedMarkerResponse => ({
  feedId,
  entityId,
  userId: activeUser.userId,
  readToSegment: 0,
  deliveredToSegment: 0,
  unreadCount: 0,
  createdAt: date,
  updatedAt: date,
  isMentioned: false,
  oldUnreadCount: 0,
  lastMentionSegment: 0,
  ...params,
});

export const generateMessageMarker = ({
  feedId,
  contentId,
  ...params
}: MakeRequired<Amity.MessageMarker, 'feedId' | 'contentId'>): Amity.MessageMarker => ({
  feedId,
  contentId,
  creatorId: activeUser.userId,
  readCount: 0,
  deliveredCount: 0,
  createdAt: date,
  updatedAt: date,
  ...params,
});
export const generateFeedMarker = ({
  feedId,
  entityId,
  ...params
}: MakeRequired<Amity.FeedMarker, 'feedId' | 'entityId'>): Amity.FeedMarker => ({
  feedId,
  entityId,
  lastSegment: 0,
  isDeleted: false,
  createdAt: date,
  updatedAt: date,
  ...params,
});

export const generateUserMarker = (params?: Partial<Amity.UserMarker>): Amity.UserMarker => ({
  lastSyncAt: date,
  userId: activeUser.userId,
  isMentioned: false,
  unreadCount: 0,
  createdAt: date,
  updatedAt: date,
  ...params,
});

export const generateUserMarkerResponse = (
  params?: Partial<Amity.UserMarker>,
): Amity.UserMarkerResponse => ({
  lastSyncAt: date,
  userId: activeUser.userId,
  isMentioned: false,
  unreadCount: 0,
  createdAt: date,
  updatedAt: date,
  ...params,
});

export const generateFeedMarkerResponse = (
  params?: Partial<Amity.FeedMarker>,
): Amity.FeedMarker => ({
  feedId: 'feedId',
  entityId: 'entityId',
  lastSegment: 0,
  isDeleted: false,
  createdAt: date,
  updatedAt: date,
  ...params,
});
