/**
 * The function use to get value of unreadCount field.
 * function will get the value from marker params first, if there is no hasMentioned field, will look in to the cache.
 *
 * If consistent mode is enabled, the function will return the value from the channelUnreadCountInfo cache.
 * If not, the function will return the value from the channelMarker cache.
 * If not found in the both cache, use `0` as defaul value.
 */
export declare const getSubChannelsUnreadCount: (channel: Omit<Amity.RawChannel, "messageCount">, marker?: Amity.ChannelMarker) => number;
