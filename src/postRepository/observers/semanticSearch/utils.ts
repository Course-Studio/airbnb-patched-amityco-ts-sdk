export function preparePostResponse(response: Amity.SemanticSearchPostPayload) {
  return response.posts.map(post => {
    const postScore = response.searchResult.find(result => result.postId === post.postId)!;
    return `${post.postId}:${postScore.score}`;
  });
}

export function getPostIdsFromCache(cacheData?: string[]) {
  return (cacheData ?? []).map(postIdWithScore => {
    return postIdWithScore.split(':')[0];
  });
}
