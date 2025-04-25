import { pullFromCache, pushToCache } from '~/cache/api';
import { updateSubChannelCache } from '../../subChannelRepository/utils/updateSubChannelCache';
import { getSubChannel } from '~/subChannelRepository/api/getSubChannel';
import { getActiveClient } from '~/client/api/activeClient';
import { convertDateStringToTimestamp } from '~/utils/dateTime';

const getMessagePreviewSetting = async () => {
  const client = getActiveClient();
  return client.getMessagePreviewSetting(false);
};

const getSubChannelCache = async (subChannelId: string): Promise<Amity.SubChannel> => {
  let subChannelCache = pullFromCache<Amity.SubChannel>(['subChannel', 'get', subChannelId])?.data;

  if (!subChannelCache) {
    subChannelCache = (await getSubChannel(subChannelId)).data;
  }

  return subChannelCache;
};

const isLastestMessageOnSubchannel = (message: Amity.InternalMessage) => {
  const cache = pullFromCache<Amity.InternalMessagePreview>([
    'messagePreviewSubChannel',
    'get',
    message.subChannelId,
  ])?.data;
  // The message payload from optimistic created event has no segment, so we check createdAt instead.
  return (
    !cache ||
    cache.segment <= message.channelSegment ||
    convertDateStringToTimestamp(cache.createdAt) <= convertDateStringToTimestamp(message.createdAt)
  );
};

const isLastestMessageOnChannel = (message: Amity.InternalMessage) => {
  const cache = pullFromCache<Amity.InternalMessagePreview>([
    'messagePreviewChannel',
    'get',
    message.channelId,
  ])?.data;
  return (
    !cache ||
    convertDateStringToTimestamp(cache.createdAt) <= convertDateStringToTimestamp(message.createdAt)
  );
};

export const handleMessageCreatedOnSubChannel = async (message: Amity.InternalMessage) => {
  const messagePreviewSetting = await getMessagePreviewSetting();

  const {
    channelId,
    messageId: messagePreviewId,
    creatorId,
    createdAt,
    updatedAt,
    data,
    dataType,
    subChannelId,
    channelSegment: segment,
    isDeleted,
  } = message;

  // 1. get subChannel from cache, if not exist fetch from server
  const subChannelCache = await getSubChannelCache(subChannelId);

  // 2. if messagePreviewSetting is NO_MESSAGE_PREVEIW, update only lastActiviy in subChannel cache
  if (messagePreviewSetting === Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW) {
    // 2.1 if the message is the latest message, update lastActivity to be createdAt in subChannel cache
    if (
      convertDateStringToTimestamp(subChannelCache.lastActivity) <
      convertDateStringToTimestamp(createdAt)
    )
      updateSubChannelCache(message.subChannelId, subChannelCache as Amity.SubChannel, {
        lastActivity: createdAt,
      });

    return;
  }

  // 3. if messagePreviewSetting is `NOT` NO_MESSAGE_PREVEIW, update messagePreviewSubChannel and subChannel cache
  // 3.1 check if the message is the latest message, if not ignore the message.
  if (!isLastestMessageOnSubchannel(message)) return;

  // 3.2 if the message is the latest message, update messagePreviewSubChannel and subChannel cache
  pushToCache(['messagePreviewSubChannel', 'get', message.subChannelId], {
    channelId,
    creatorId,
    messagePreviewId,
    createdAt,
    updatedAt,
    subChannelId,
    data,
    dataType,
    segment,
    isDeleted,
    subChannelUpdatedAt: subChannelCache?.updatedAt!,
    subChannelName: subChannelCache?.displayName,
  } as Amity.InternalMessagePreview);

  updateSubChannelCache(message.subChannelId, subChannelCache as Amity.SubChannel, {
    lastActivity: createdAt,
    messagePreviewId,
  });
};

export const handleMessageUpdatedOnSubChannel = async (message: Amity.InternalMessage) => {
  const {
    channelId,
    messageId: messagePreviewId,
    creatorId,
    createdAt,
    updatedAt,
    data,
    dataType,
    subChannelId,
    channelSegment: segment,
    isDeleted,
  } = message;

  const messagePreviewSubChannelCache = pullFromCache<Amity.InternalMessagePreview>([
    'messagePreviewSubChannel',
    'get',
    message.subChannelId,
  ])?.data;

  // if messagePreviewSubChannel is not exist, ignore the message.
  if (
    messagePreviewSubChannelCache &&
    messagePreviewSubChannelCache.messagePreviewId === message.messageId
  ) {
    const subChannelCache = await getSubChannelCache(subChannelId);
    pushToCache(['messagePreviewSubChannel', 'get', message.subChannelId], {
      channelId,
      creatorId,
      messagePreviewId,
      createdAt,
      updatedAt,
      subChannelId,
      data,
      dataType,
      segment,
      isDeleted,
      subChannelUpdatedAt: subChannelCache.updatedAt,
      subChannelName: messagePreviewSubChannelCache.subChannelName,
    } as Amity.InternalMessagePreview);
  }
};

export const handleMessageCreated = async (message: Amity.InternalMessage) => {
  const {
    channelId,
    messageId: messagePreviewId,
    creatorId,
    createdAt,
    updatedAt,
    data,
    dataType,
    subChannelId,
    channelSegment: segment,
    isDeleted,
  } = message;

  if (isLastestMessageOnChannel(message)) {
    const subChannelCache = await getSubChannelCache(subChannelId);

    pushToCache(['messagePreviewChannel', 'get', message.channelId], {
      channelId,
      creatorId,
      messagePreviewId,
      createdAt,
      updatedAt,
      subChannelId,
      data,
      dataType,
      segment,
      isDeleted,
      subChannelUpdatedAt: subChannelCache?.updatedAt!,
      subChannelName: subChannelCache?.displayName,
    } as Amity.InternalMessagePreview);
  }
};

export const handleMessageUpdated = async (message: Amity.InternalMessage) => {
  /**
   * Channel Case
   */

  const {
    channelId,
    messageId: messagePreviewId,
    creatorId,
    createdAt,
    updatedAt,
    data,
    dataType,
    subChannelId,
    channelSegment: segment,
    isDeleted,
  } = message;

  const messagePreviewChannelCache = pullFromCache<Amity.InternalMessagePreview>([
    'messagePreviewChannel',
    'get',
    message.channelId,
  ])?.data;

  if (
    messagePreviewChannelCache &&
    messagePreviewChannelCache.messagePreviewId === message.messageId
  ) {
    const subChannelCache = await getSubChannelCache(subChannelId);
    pushToCache(['messagePreviewChannel', 'get', message.channelId], {
      channelId,
      creatorId,
      messagePreviewId,
      createdAt,
      updatedAt,
      subChannelId,
      data,
      dataType,
      segment,
      isDeleted,
      subChannelUpdatedAt: subChannelCache.updatedAt,
      subChannelName: messagePreviewChannelCache.subChannelName,
    } as Amity.InternalMessagePreview);
  }
};

export const handleSubChannelUpdated = async (subChannel: Amity.SubChannel) => {
  const { channelId, subChannelId } = subChannel;

  /** Channel Case */
  const messagePreviewChannelCache = pullFromCache<Amity.InternalMessagePreview>([
    'messagePreviewChannel',
    'get',
    channelId,
  ])?.data;

  if (messagePreviewChannelCache?.subChannelId === subChannelId) {
    const subChannelCache = pullFromCache<Amity.SubChannel>([
      'subChannel',
      'get',
      subChannelId,
    ])?.data;

    pushToCache(['messagePreviewChannel', 'get', channelId], {
      ...messagePreviewChannelCache,
      subChannelName: subChannelCache?.displayName,
      subChannelUpdatedAt: subChannelCache?.updatedAt!,
    } as Amity.InternalMessagePreview);
  }

  /** SubChannel Case */
  const messagePreviewSubChannelCache = pullFromCache<Amity.InternalMessagePreview>([
    'messagePreviewSubChannel',
    'get',
    subChannelId,
  ])?.data;

  if (
    messagePreviewSubChannelCache &&
    new Date(messagePreviewSubChannelCache.updatedAt!).valueOf() >
      new Date(subChannel.updatedAt!).valueOf()
  ) {
    const subChannelCache = pullFromCache<Amity.SubChannel>([
      'subChannel',
      'get',
      subChannelId,
    ])?.data;

    pushToCache(['messagePreviewSubChannel', 'get', subChannelId], {
      ...messagePreviewSubChannelCache,
      subChannelName: subChannelCache?.displayName,
      subChannelUpdatedAt: subChannelCache?.updatedAt!,
    } as Amity.InternalMessagePreview);
  }
};
