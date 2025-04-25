import {
  client,
  comment12,
  comment12Payload,
  connectClient,
  deletedCommentPayload,
  deletedCommentResponse,
  disconnectClient,
  imageCommentPayload,
  imageCommentResponse,
  post11,
  textAndImageCommentMixedPayload,
  textCommentPayload,
  textCommentRequestPayload,
  textCommentResponse,
} from '~/utils/tests';
import { ASCApiError } from '~/core/errors';

import { queryComments } from '../queryComments';

type mockParamAndResponse = {
  query: Amity.QueryComments;
  response: Amity.InternalComment[];
};

const queryParams: mockParamAndResponse = {
  query: {
    referenceType: 'post',
    referenceId: post11.postId,
  },
  response: textCommentPayload.comments,
};

const queryImageOnly: mockParamAndResponse = {
  query: {
    ...queryParams.query,
    dataTypes: {
      values: ['image'],
      matchType: 'exact',
    },
  },
  response: imageCommentPayload.comments,
};

const queryImageAny: mockParamAndResponse = {
  query: {
    ...queryParams.query,
    dataTypes: {
      values: ['image'],
      matchType: 'any',
    },
  },
  response: textAndImageCommentMixedPayload.comments,
};

const queryWithParentId: mockParamAndResponse = {
  query: {
    ...queryParams.query,
    parentId: comment12.parentId,
  },
  response: comment12Payload.comments,
};

const deletedComment: mockParamAndResponse = {
  query: {
    ...queryParams.query,
    includeDeleted: true,
  },
  response: deletedCommentPayload.comments,
};

describe('queryComments', () => {
  beforeAll(connectClient);
  afterAll(disconnectClient);

  const testCase: [string, object, Amity.QueryComments, Amity.InternalComment[]][] = [
    [
      // integration_test_id: 0be48975-be6d-4199-bec0-af186af444d3
      'Should return valid comment when user query with valid query',
      textCommentResponse,
      queryParams.query,
      queryParams.response,
    ],
    [
      // integration_test_id: 4550e036-53d0-4f35-b83f-9edc10f1c974

      'Should return only valid image comment types when user query with dataType exact image',
      imageCommentResponse,
      queryImageOnly.query,
      queryImageOnly.response,
    ],
    [
      // integration_test_id: 03056892-251f-4a85-a9bf-f9978c1912e5
      'Should return only valid deleted comment list when user query with isDeleted=true',
      deletedCommentResponse,
      deletedComment.query,
      deletedComment.response,
    ],
    [
      // integration_test_id: 2f68da78-7738-4371-ae72-b6a4ff043404

      'Should return only valid mixed types comment list when user query with dataType any image',
      {
        data: {
          ...textAndImageCommentMixedPayload,
          paging: {},
        },
      },
      queryImageAny.query,
      queryImageAny.response,
    ],
    [
      // integration_test_id: 8207d436-a800-4224-8fb0-a46c05f7d11e
      'Should return only valid mixed types comment list when user query with parent_id',
      {
        data: {
          ...comment12Payload,
          paging: {},
        },
      },
      queryWithParentId.query,
      queryWithParentId.response,
    ],
  ];

  test.each(testCase)('%s', async (title, mockResponse, query, expectResult) => {
    client.http.get = jest.fn().mockResolvedValueOnce(mockResponse);
    const result = await queryComments(query);
    expect(result.data).toEqual(expectResult);
  });

  const errorCase: [string, number, Amity.QueryComments][] = [
    [
      // integration_test_id: 2719d77f-177a-401f-864f-ef0f0804cc24
      'Should return error 400400 when query with wrong post_id', // title
      Amity.ServerError.ITEM_NOT_FOUND, // errorCode
      textCommentRequestPayload, // payload
    ],
  ];

  test.each(errorCase)('%s', async (title, errorCode, payload) => {
    client.http.get = jest
      .fn()
      .mockRejectedValueOnce(new ASCApiError('not found!', errorCode, Amity.ErrorLevel.ERROR));
    await expect(queryComments(payload)).rejects.toThrow();
  });
});
