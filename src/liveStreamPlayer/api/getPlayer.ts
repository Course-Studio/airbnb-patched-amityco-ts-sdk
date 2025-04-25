import Hls from 'hls.js';
import { getStream } from '~/streamRepository/internalApi/getStream';
import { EventRegister } from '../utils/eventRegister';

/**
 * Returns a live stream video player
 *
 * @memberof LiveStreamPlayer
 * @function getPlayer
 * @static
 *
 * @param {string} parameters.streamId - The ID of the stream.
 * @return {HTMLVideoElement} HTML video element
 *
 */
export const getPlayer = async (parameters: { streamId: string }): Promise<HTMLVideoElement> => {
  const { streamId } = parameters;
  if (!document) {
    throw new Error('This method can be invoked within the browser enviornment only');
  }

  if (!Hls.isSupported()) {
    throw new Error('This browswer does not support hls, unable to play stream');
  }

  // don't catch error let it throw
  const { data: stream } = await getStream(streamId);

  // if live recordings might be null, need to verify
  const { watcherUrl, status, recordings = [], resolution } = stream;

  if (!watcherUrl.hls) {
    throw new Error('This stream does not support hls. Unable to play');
  }

  const video = document.createElement('video');
  video.id = streamId;
  video.controls = true;

  const hls = new Hls();
  hls.attachMedia(video);

  // usage should not be calculated for recorded video
  if (status !== 'recorded') {
    let { url } = watcherUrl.hls;

    /*
     * Fixes mixed content error
     */
    url = url.replace('http:', 'https:');

    hls.loadSource(url);
  } else {
    const recording = recordings.find(rec => !!rec.mp4);

    if (!recording || !recording.mp4) {
      throw new Error('No playable recording available');
    }

    video.src = recording.mp4.url;
  }

  new EventRegister(video, resolution).registerEvents();

  return video;
};
