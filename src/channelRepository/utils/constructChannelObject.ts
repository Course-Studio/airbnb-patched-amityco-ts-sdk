import { getChannelMessagePreviewWithUser } from '~/messagePreview/utils';
import { constructChannelDynamicValue } from './constructChannelDynamicValue';
import { LinkedObject } from '~/utils/linkedObject';

export const constructChannelObject = (channel: Amity.StaticInternalChannel): Amity.Channel => {
  /**
   * convert internal cache data to be public channel data
   * 1. [getChannelMessagePreviewWithUser] add messagePreview >> Amity.InternalChannel -> Amity.InternalChannel
   * 2. [constructChannelDynamicValue] construct getter value >> Amity.StaticInternalChannel -> Amity.Channel
   * 3. [LinkedObject.channel] add markAsRead >> Amity.InternalChannel -> Amity.Channel
   */

  return LinkedObject.channel(
    constructChannelDynamicValue(getChannelMessagePreviewWithUser(channel)),
  );
};
