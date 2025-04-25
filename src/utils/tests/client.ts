import {
  createClient,
  login as sdkConnectClient,
  logout as sdkDisconnectClient,
} from '~/client/api';

import * as messagePreviewSetting from '~/client/utils/messagePreviewEngine';

import { user11 } from './dummy';

export const activeUser = user11;

const sessionHandler: Amity.SessionHandler = {
  sessionWillRenewAccessToken(_) {
    // do nothing
  },
};

jest
  .spyOn(messagePreviewSetting, 'getMessagePreviewSetting')
  .mockResolvedValue(Amity.MessagePreviewSetting.MESSAGE_PREVIEW_INCLUDE_DELETED);

export const client = createClient('key', 'sg');
client.userId = 'test';
client.accessTokenExpiryWatcher = _ => () => {
  //
};

export const connectClient = async () => {
  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setDate(now.getDate() + 30);

  client.mqtt.connect = jest.fn();
  client.mqtt.subscribe = jest.fn();
  client.http.post = jest.fn().mockReturnValueOnce({
    data: {
      accessToken: 'accessToken',
      users: [activeUser],
      expiresAt: nextMonth.toISOString(),
      issuedAt: now.toISOString(),
    },
  });

  // test will fail randomly if we have this
  setTimeout(() => {
    client.ws.io.emit('connect');
    // fixes jest warning of open handles
  }, 500).unref();

  await sdkConnectClient({ userId: client.userId! }, sessionHandler);
};

export const disconnectClient = async () => {
  sdkDisconnectClient().then(() => client.ws.emit('disconnect'));
};

export default {};
