import { atob, btoa } from 'js-base64';
import uuid from 'react-native-uuid';

const privateKey = process.env.LIVE_STREAM_KEY;
/*
 * The crypto algorithm used for importing key and signing string
 */
const ALGORITHM = {
  name: 'RSASSA-PKCS1-v1_5',
  hash: { name: 'SHA-256' },
};

/*
 * IMPORTANT!
 * If you are recieving key from other platforms use an online tool to convert
 * the PKCS1 to PKCS8. For instance the key from Android SDK is of the format
 * PKCS1.
 *
 * If recieving from the platform, verify if it's already in the expected
 * format. Otherwise the crypto.subtle.importKey will throw a DOMException
 */
const PRIVATE_KEY_SIGNATURE = 'pkcs8';

/*
 * Ensure that the private key in the .env follows this format
 */
const PEM_HEADER = '-----BEGIN PRIVATE KEY-----';
const PEM_FOOTER = '-----END PRIVATE KEY-----';

/*
 * The crypto.subtle.sign function returns an ArrayBuffer whereas the server
 * expects a base64 string. This util helps facilitate that process
 */
function base64FromArrayBuffer(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  let binary = '';

  uint8Array.forEach(byte => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

/*
 * Convert a string into an ArrayBuffer
 * from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
 *
 * Solely used by the importPrivateKey method
 */
function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);

  for (let i = 0, strLen = str.length; i < strLen; i += 1) {
    bufView[i] = str.charCodeAt(i);
  }

  return buf;
}

function importPrivateKey(pem: string) {
  // fetch the part of the PEM string between header and footer
  const pemContents = pem.substring(PEM_HEADER.length, pem.length - PEM_FOOTER.length);

  /*
   * base64 decode the string to get the binary data
   */
  const binaryDerString = atob(pemContents);

  // convert from a binary string to an ArrayBuffer
  const binaryDer = str2ab(binaryDerString);

  return crypto.subtle.importKey(PRIVATE_KEY_SIGNATURE, binaryDer, ALGORITHM, false, ['sign']);
}

export async function createSignature({
  timestamp,
  streams,
}: {
  timestamp: string;
  streams: Amity.UsageDataModel[];
}) {
  if (!privateKey) return;

  const dataStr = streams
    .map(item =>
      Object.keys(item)
        .sort()
        .map(key => `${key}=${item[key]}`)
        .join('&'),
    )
    .join(';');

  /*
   * nonceStr needs to be unique for each request
   */
  const nonceStr = uuid.v4();
  const signStr = `nonceStr=${nonceStr}&timestamp=${timestamp}&data=${dataStr}==`;
  const encoder = new TextEncoder();
  const data = encoder.encode(signStr);

  const key = await importPrivateKey(privateKey);
  const sign = await crypto.subtle.sign(ALGORITHM, key, data);

  return { signature: base64FromArrayBuffer(sign), nonceStr };
}
