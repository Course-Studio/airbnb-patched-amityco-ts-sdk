export function prepareCommentPayload(
  commentPayload: Amity.CommentPayload,
): Amity.ProcessedCommentPayload {
  const { comments } = commentPayload;

  return {
    ...commentPayload,
    comments: comments.map(comment => {
      if (comment.hasOwnProperty('myReactions')) return comment;

      // Sometimes `myReactions` field will not come with BE response because that field is empty
      // We need to put it with an empty array manually to make it show up in client side
      return {
        myReactions: [],
        ...comment,
      };
    }),
  };
}
