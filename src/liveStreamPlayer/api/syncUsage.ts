import { getActiveClient } from '~/client';

import { createSignature } from '../utils/cryptoSignatureUtils';

export async function syncUsage({
  bufferCurrentUsage,
  getActiveStreams,
  updateUsage,
  dispose,
}: {
  bufferCurrentUsage: () => Amity.UsageDataModel[];
  getActiveStreams: () => string[];
  updateUsage: (data: Amity.UsageDataModel) => void;
  dispose: () => void;
}) {
  const streams = bufferCurrentUsage();
  if (!streams.length) return;

  try {
    const timestamp = new Date().toISOString();
    const signatureData = await createSignature({ timestamp, streams });

    if (!signatureData || !signatureData.signature) {
      throw new Error('Signature is undefined');
    }

    const payload = {
      signature: signatureData.signature,
      nonceStr: signatureData.nonceStr,
      timestamp,
      streams,
    };

    const client = getActiveClient();

    await client.http.post<{ ok: boolean }>('/api/v3/user-event/video-streaming', payload);

    if (!getActiveStreams().length && !bufferCurrentUsage().length) {
      dispose();
    }

    return true;
  } catch (err: any) {
    // push buffer back to usage collector and try again in the next interval
    streams.forEach(stream => updateUsage(stream));
    return false;
  }
}
