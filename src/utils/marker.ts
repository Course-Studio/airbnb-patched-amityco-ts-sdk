function doConvert<
  T extends
    | Amity.UserEntityMarkerResponse
    | Amity.UserMarkerResponse
    | Amity.UserFeedMarkerResponse,
>(markerResponses: T[]): (Omit<T, 'isMentioned'> & { hasMentioned: boolean })[] {
  return markerResponses.map(({ isMentioned, ...rest }) => ({
    hasMentioned: isMentioned,
    ...rest,
  }));
}

export function convertChannelMarkerResponse(
  channelMarkerResponse: Amity.UserEntityMarkerResponse[],
): Amity.ChannelMarker[] {
  return doConvert(channelMarkerResponse);
}

export function convertSubChannelMarkerResponse(
  subChannelMarkerResponse: Amity.UserFeedMarkerResponse[],
): Amity.SubChannelMarker[] {
  return doConvert(subChannelMarkerResponse);
}
