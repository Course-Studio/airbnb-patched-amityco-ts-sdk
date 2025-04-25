import { dropFromCache, pullFromCache, pushToCache, queryCache } from '~/cache/api';
import { getChatSettings } from '../api/getChatSettings';

import { getChannelByIds } from '~/channelRepository/api/getChannelByIds';
import { getSubChannels as getSubChannelByIds } from '~/subChannelRepository/api/getSubChannels';

const convertMessagePreviewSetting = (
  chatSetting: Amity.ChatSettings,
): Amity.MessagePreviewSetting => {
  if (!chatSetting.messagePreview.enabled) return Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW;

  if (!chatSetting.messagePreview.isIncludeDeleted)
    return Amity.MessagePreviewSetting.MESSAGE_PREVIEW_NOT_INCLUDE_DELETED;

  return Amity.MessagePreviewSetting.MESSAGE_PREVIEW_INCLUDE_DELETED;
};

/**
 * ```js
 * import { getMessagePreviewSetting } from '@amityco/ts-sdk'
 * const messagePreviewSetting = await getMessagePreviewSetting();
 * ```
 *
 * A util to getMessagePreviewSetting from cache or fetch from server
 * @returns A a {@link Amity.MessagePreviewSetting} enum
 *
 * @category private
 * @async
 */
export const getMessagePreviewSetting = async (
  refresh = true,
): Promise<Amity.MessagePreviewSetting> => {
  const messagePreviewSetting = pullFromCache<Amity.MessagePreviewSetting>([
    'MessagePreviewSetting',
  ])?.data;

  if (!refresh && messagePreviewSetting) return messagePreviewSetting;

  const newChatSettings = await getChatSettings();
  const newMessagePreviewSetting = convertMessagePreviewSetting(newChatSettings);

  return newMessagePreviewSetting;
};

/**
 * get messagePreviewSetting from cache and compare with new messagePreviewSetting
 * if new messagePreviewSetting is different from cache, check setting and update data in cache
 * @returns void
 *
 * @category private
 * @async
 */
export const initializeMessagePreviewSetting = async () => {
  const newMessagePreviewSetting = await getMessagePreviewSetting();

  const messagePreviewSetting = pullFromCache<Amity.MessagePreviewSetting>([
    'MessagePreviewSetting',
  ])?.data;

  if (newMessagePreviewSetting === messagePreviewSetting) return;

  pushToCache(['MessagePreviewSetting'], newMessagePreviewSetting);

  const channelWithIsDeletedTrue: Amity.Channel['channelId'][] = [];
  const subChannelWithIsDeletedTrue: Amity.SubChannel['subChannelId'][] = [];

  if (newMessagePreviewSetting === Amity.MessagePreviewSetting.NO_MESSAGE_PREVIEW) {
    /* remove alll messagePreview cache */
    const messagePreviewCache = queryCache<Amity.InternalMessagePreview>(['MessagePreview']);
    if (messagePreviewCache && messagePreviewCache?.length > 0) {
      messagePreviewCache.forEach(({ key, data }) => {
        dropFromCache(key);

        if (key.includes('MessagePreviewChannel')) {
          channelWithIsDeletedTrue.push(data.channelId);
        }

        if (key.includes('MessagePreviewSubChannel')) {
          subChannelWithIsDeletedTrue.push(data.subChannelId);
        }
      });
    }
  } else if (
    newMessagePreviewSetting === Amity.MessagePreviewSetting.MESSAGE_PREVIEW_NOT_INCLUDE_DELETED
  ) {
    /* remove messagePreview cache which isDelete = true */
    const messagePreviewCache = queryCache<Amity.InternalMessagePreview>(['MessagePreview']);
    if (messagePreviewCache && messagePreviewCache?.length > 0) {
      messagePreviewCache.forEach(({ key, data }) => {
        if (data?.isDeleted) {
          dropFromCache(key);
          if (key.includes('MessagePreviewChannel')) {
            channelWithIsDeletedTrue.push(data.channelId);
          }

          if (key.includes('MessagePreviewSubChannel')) {
            subChannelWithIsDeletedTrue.push(data.subChannelId);
          }
        }
      });
    }

    /**
     * update messagePreviewId in case of
     * 1. message preview is disabled and there is messagePreviewId in cache
     * 2. channel and subChannel which isDelete = true
     */

    if (channelWithIsDeletedTrue.length !== 0) await getChannelByIds(channelWithIsDeletedTrue);

    if (subChannelWithIsDeletedTrue.length !== 0)
      await getSubChannelByIds(subChannelWithIsDeletedTrue);
  }
};
