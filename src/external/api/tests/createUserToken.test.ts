import { getFutureDate } from '~/core/model';
import { createHttpTransport } from '~/core/transports';
import { createUserToken } from '../createUserToken';

jest.mock('~/core/transports', () => ({
  __esModule: true,
  ...jest.requireActual('~/core/transports'),
  createHttpTransport: jest.fn(),
}));

describe('createUserToken', () => {
  // integration_test_id: 4771d3b9-1a05-4942-85e1-d2abea936c2f
  it('should return a valid token', async () => {
    const payload = {
      accessToken: 'accessToken',
      issuedAt: new Date().toISOString(),
      expiresAt: getFutureDate(),
    };
    (createHttpTransport as jest.Mock).mockReturnValue({ post: () => ({ data: payload }) });

    const { accessToken } = await createUserToken('apiKey', 'sg', {
      userId: 'userId',
      displayName: 'displayName',
    });

    expect(accessToken).toStrictEqual('accessToken');
  });
});
