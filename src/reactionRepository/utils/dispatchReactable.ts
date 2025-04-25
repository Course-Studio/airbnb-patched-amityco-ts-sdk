import { fireEvent } from '~/core/events';

/** @hidden */
export const dispatchReactable = <T extends Amity.ReactableType>(
  referenceType: T,
  model: Amity.Models[T],
) => {
  if (referenceType === 'message')
    // @ts-ignore: refactor later
    fireEvent('local.message.updated', { messages: [model] });
  else if (referenceType === 'post')
    // @ts-ignore: refactor later
    fireEvent('post.updated', { posts: [model] });
  else if (referenceType === 'comment')
    // @ts-ignore: refactor later
    fireEvent('comment.updated', { comments: [model] });
  else if (referenceType === 'story')
    // Need to provide all data same StoryPayload from BE
    fireEvent('story.updated', {
      categories: [],
      comments: [],
      communities: [],
      communityUsers: [],
      files: [],
      users: [],
      stories: [model as Amity.StoryPayload['stories'][0]],
    });
};
