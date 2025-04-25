import { getActiveClient } from '~/client/api/activeClient';
import { getActiveUser } from '~/client/api/activeUser';
import { proxyMqttEvents } from '~/core/events';

let mqttAccessToken: string;
let mqttUserId: string;

export async function modifyMqttConnection() {
  const { mqtt, emitter, token } = getActiveClient();
  if (!mqtt) return;

  const accessToken = token?.accessToken ?? '';

  const user = getActiveUser();

  if (mqttAccessToken !== accessToken || mqttUserId !== user._id) {
    mqttAccessToken = accessToken!;
    mqttUserId = user._id!;

    await mqtt.connect({ accessToken: mqttAccessToken, userId: mqttUserId });
    proxyMqttEvents(mqtt, emitter);
  }
}
