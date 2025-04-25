import { date, feed11, user11 } from '.';

import { encodeJson } from '..';

export function generateInternalPost(params?: Partial<Amity.InternalPost>): Amity.InternalPost {
  return {
    children: [],
    comments: [],
    commentsCount: 0,
    createdAt: date,
    data: { text: 'post11' },
    editedAt: date,
    feedId: '',
    flagCount: 0,
    hashFlag: null,
    impression: 0,
    reach: 0,
    hasFlaggedComment: false,
    hasFlaggedChildren: false,
    parentId: 'post12',
    path: '',
    postedUserId: user11.userId,
    postId: 'post11',
    isDeleted: false,
    reactions: {},
    reactionsCount: 0,
    myReactions: [],
    targetId: user11.userId,
    targetType: 'user',
    updatedAt: date,
    parentPostId: '',
    ...params,
  };
}

export function generatePost(params?: Partial<Amity.Post>): Amity.Post {
  const internalPost = generateInternalPost(params);
  return {
    ...internalPost,
    latestComments: [],
    creator: user11,
    analytics: {
      markAsViewed: () => {
        // nothing
      },
    },
  };
}

export const post11: Amity.Post = generatePost();

export const post12: Amity.Post = {
  ...post11,
  postId: 'post12',
};

export const post13: Amity.Post = {
  ...post11,
  postId: 'post13',
};

export const post14: Amity.Post = {
  ...post11,
  postId: 'post14',
  targetType: 'community',
  feedId: 'feedId',
  isDeleted: false,
  children: [],
};

export const post15: Amity.Post = {
  ...post11,
  postId: 'post15',
  isDeleted: true,
  children: [post11.postId],
  feedId: 'feedId',
  targetType: 'community',
  tags: ['test_tag'],
};

export const post16: Amity.Post = {
  ...post11,
  postId: 'post16',
  targetType: 'user',
};

export const internalPost11: Amity.InternalPost = generateInternalPost();

export const internalPost12: Amity.InternalPost = {
  ...internalPost11,
  postId: 'post12',
};

export const internalPost13: Amity.InternalPost = {
  ...internalPost11,
  postId: 'post13',
};

export const posts = {
  targetId: user11.userId,
  targetType: 'user' as Amity.PostTargetType,
  page1: [post11.postId, post12.postId, post13.postId],
  page2: ['postId21', 'postId22', 'postId23'],
  page3: ['postId31', 'postId32', 'postId33'],
};

export const emptyPostPayload = {
  posts: [],
  postChildren: [],
  communities: [],
  communityUsers: [],
  categories: [],
  comments: [],
  feeds: [],
  users: [],
  files: [],
};

const nextPage = encodeJson({ before: post13.postId, limit: 10 });

export const postQueryResponse = {
  data: {
    ...emptyPostPayload,
    posts: [post11, post12, post13],
    reactor: { userId: 'test' },
    users: [user11],
    paging: {
      next: nextPage,
    },
  } as Amity.ProcessedPostPayload & Amity.Pagination,
};

export const postQueryResponse2 = {
  data: {
    ...emptyPostPayload,
    posts: [post14, post15],
    reactor: { userId: 'test' },
    users: [user11],
    paging: {
      next: nextPage,
    },
  } as Amity.ProcessedPostPayload & Amity.Pagination,
};

export const postQueryResponsePage2 = {
  data: {
    ...emptyPostPayload,
    posts: [post14, post15],
    feeds: [{ ...feed11, feedType: 'reviewing', targetId: post14.targetId, feedId: post14.feedId }],
    users: [user11],
    paging: {
      next: nextPage,
    },
  } as Amity.ProcessedPostPayload & Amity.Pagination,
};
