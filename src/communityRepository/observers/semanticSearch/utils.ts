export function prepareSemanticCommunitiesReferenceId(
  response: Amity.SemanticSearchCommunityPayload,
) {
  return response.communities.map(community => {
    const score = response.searchResult.find(
      result => result.communityId === community.communityId,
    )!;
    return `${community.communityId}:${score}`;
  });
}

export function getCommunityIdsFromCache(cacheData?: string[]) {
  return (cacheData ?? []).map(communityIdWithScore => {
    return communityIdWithScore.split(':')[0];
  });
}
