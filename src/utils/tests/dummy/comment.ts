import { createComment } from '~/commentRepository/api';
import { community11, communityUser11 } from '~/utils/tests';
import { file11 } from './file';
import { post11 } from './post';
import { user11, user12 } from './user';

export function generateInternalComment(
  params?: Partial<Amity.InternalComment>,
): Amity.InternalComment {
  return {
    path: '',
    referenceType: 'post',
    dataType: 'text',
    dataTypes: ['text'],
    rootId: 'test',
    data: {
      text: 'yellow new world',
    },
    childrenNumber: 0,
    isDeleted: false,
    editedAt: '2022-10-31T05:57:45.661Z',
    updatedAt: '2022-10-31T05:57:45.670Z',
    createdAt: '2022-10-31T05:57:45.661Z',
    segmentNumber: 2,
    commentId: 'comment11', // comment11._id
    userId: 'test', // user11._id
    referenceId: post11.postId,
    flagCount: 0,
    hashFlag: null,
    children: [],
    mentionees: [],
    reactions: {},
    myReactions: [],
    reactionsCount: 0,
    attachments: [],
    targetId: 'community11', // community11._id
    targetType: 'community',
    ...params,
  };
}

export const generateComment = (params?: Partial<Amity.InternalComment>) => {
  const basedComment = generateInternalComment(params);
  return {
    ...basedComment,
    creator: user11,
    childrenComment: [],
    target: {
      type: 'community',
      communityId: 'community11', // community11._id
      creatorMember: communityUser11 as Amity.Membership<'community'>,
    },
  };
};

export const comment11: Amity.InternalComment = generateComment();

export const imageComment11: Amity.InternalComment = generateComment({
  dataTypes: ['image'],
  data: { text: '' },
  attachments: [
    {
      type: 'image',
      fileId: file11.fileId,
    },
  ],
});

export const textImageComment11: Amity.InternalComment = generateComment({
  dataTypes: ['image', 'text'],
  data: { text: 'test' },
  attachments: [
    {
      type: 'image',
      fileId: file11.fileId,
    },
  ],
});

export const textMentionComment11: Amity.InternalComment = generateComment({
  mentionees: [
    {
      type: 'user',
      userIds: [user11._id, user12._id],
    },
  ],
});

export const comment12: Amity.InternalComment = generateComment({
  commentId: 'comment12',
  parentId: comment11.commentId,
});

export const imageComment12: Amity.InternalComment = generateComment({
  ...imageComment11,
  commentId: comment12.commentId,
});

export const textImageComment12: Amity.InternalComment = generateComment({
  ...textImageComment11,
  commentId: comment12.commentId,
});

export const textCommentPayload: Amity.CommentPayload = {
  comments: [comment11],
  users: [user11],
  commentChildren: [],
  files: [],
  communityUsers: [],
};

export const comment12Payload: Amity.CommentPayload = {
  comments: [comment12, imageComment12, textImageComment12],
  users: [user11],
  commentChildren: [],
  files: [file11],
  communityUsers: [],
};

export const imageCommentPayload: Amity.CommentPayload = {
  comments: [imageComment11],
  users: [user11],
  commentChildren: [],
  files: [file11],
  communityUsers: [],
};

export const textImageCommentPayload: Amity.CommentPayload = {
  comments: [textImageComment11],
  users: [user11, user12],
  commentChildren: [],
  files: [file11],
  communityUsers: [],
};

export const textCommentMentionPayload: Amity.CommentPayload = {
  comments: [textMentionComment11],
  commentChildren: [],
  users: [user11],
  files: [],
  communityUsers: [],
};

export const postPayload: Amity.ProcessedPostPayload = {
  posts: [post11],
  users: [user11],
  files: [file11],
  comments: [comment11],
  communityUsers: [],
  categories: [],
  communities: [],
  feeds: [],
  postChildren: [],
};

export const textAndImageCommentMixedPayload: Amity.CommentPayload = {
  comments: [comment11, imageComment11, textImageComment11],
  users: [user11],
  commentChildren: [],
  files: [file11],
  communityUsers: [],
};

export const deletedCommentPayload: Amity.CommentPayload = {
  comments: [
    {
      ...comment11,
      isDeleted: true,
    },
    {
      ...imageComment11,
      isDeleted: true,
    },
    {
      ...textImageComment11,
      isDeleted: true,
    },
  ],
  users: [user11],
  commentChildren: [],
  files: [file11],
  communityUsers: [],
};

// Response - BE
export const textCommentResponse = {
  data: {
    ...textCommentPayload,
    files: [],
    commentChildren: [],
    paging: {},
  },
};

export const imageCommentResponse = {
  data: {
    ...imageCommentPayload,
    files: [],
    commentChildren: [],
    paging: {},
  },
};

export const textImageCommentResponse = {
  data: {
    ...textImageCommentPayload,
    files: [],
    commentChildren: [],
    paging: {},
  },
};

export const textMentionCommentResponse = {
  data: {
    ...textCommentMentionPayload,
    files: [],
    commentChildren: [],
    paging: {},
  },
};

export const textCommentParentIdResponse = {
  data: {
    ...comment12Payload,
    files: [],
    commentChildren: [],
    paging: {},
  },
};

export const deletedCommentResponse = {
  data: {
    ...deletedCommentPayload,
    files: [],
    commentChildren: [],
    paging: {},
  },
};

// Payload Query
export const textCommentRequestPayload: Parameters<typeof createComment>[0] = {
  referenceId: post11.postId,
  referenceType: 'post',
  data: {
    text: 'test',
  },
};

export const textCommentParentIdRequestPayload: Parameters<typeof createComment>[0] = {
  referenceId: post11.postId,
  referenceType: 'post',
  parentId: comment11.commentId,
  data: {
    text: 'test',
  },
};

export const imageCommentRequestPayload: Parameters<typeof createComment>[0] = {
  referenceId: post11.postId,
  referenceType: 'post',
  attachments: [
    {
      type: 'image',
      fileId: file11.fileId,
    },
  ],
};

export const textImageCommentRequestPayload: Parameters<typeof createComment>[0] = {
  referenceId: post11.postId,
  referenceType: 'post',
  data: {
    text: 'test',
  },
  attachments: [
    {
      type: 'image',
      fileId: file11.fileId,
    },
  ],
};

export const textCommentWithMentionRequestPayload: Parameters<typeof createComment>[0] = {
  referenceId: post11.postId,
  referenceType: 'post',
  data: {
    text: 'test',
  },
  mentionees: [
    {
      type: 'user',
      userIds: [user11._id, user12._id],
    },
  ],
};
