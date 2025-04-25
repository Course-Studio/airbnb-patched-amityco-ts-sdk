import { getMessage } from '~/messageRepository/internalApi/getMessage';
import { getPost } from '~/postRepository/api/getPost';
import { getComment } from '~/commentRepository/api/getComment';

/** @hidden */
export const fetchReference = async (
  referenceType: Amity.ReactableType,
  referenceId: string,
): Promise<Amity.Cached<Amity.Models[typeof referenceType]>> => {
  if (referenceType === 'message') return getMessage(referenceId);
  if (referenceType === 'post') return getPost(referenceId);
  if (referenceType === 'comment') return getComment(referenceId);

  throw new Error(`Incorrect referenceType: ${referenceType}`);
};
