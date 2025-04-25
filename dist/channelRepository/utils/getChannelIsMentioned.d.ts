/**
 * The function use to get value of hasMentioned or isMentioned field.
 * function will get the value from marker params first, if there is no hasMentioned field, will look in to the cache.
 *
 * If consistent mode is enabled, the function will return the value from the channelUnreadCountInfo cache.
 * If not, the function will return the value from the channelMarker cache.
 * If not found in the both cache, use `false` as defaul value.
 */
export declare const getChannelIsMentioned: (channel: Omit<Amity.RawChannel, "messageCount">, marker?: Amity.ChannelMarker) => boolean;
