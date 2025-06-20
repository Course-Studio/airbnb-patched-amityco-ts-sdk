export const streamResponse = {
  data: {
    videoStreamings: [
      {
        streamId: '123',
        userId: '123',
        thumbnailFileId: '123',
        title: 'Test Stream',
        status: 'idle',
        isLive: true,
        isDeleted: true,
        description: 'Test Stream Description',
        platform: {
          name: 'x86',
          version: '123',
        },
        startedAt: '2023-01-17T07:19:06.414Z',
        endedAt: '2023-01-17T07:19:06.414Z',
        createdAt: '2023-01-17T07:19:06.414Z',
        updatedAt: '2023-01-17T07:19:06.414Z',
        metadata: {},
        resolution: 'SD',
        streamerUrl: {
          url: 'https://test-stream.test',
          components: {
            origin: 'origin',
            appName: 'stream app',
            streamName: 'stream name',
            query: '123',
          },
        },
        recordings: [
          {
            flv: {
              url: 'https://test-stream-flv.test',
              duration: 0,
              startTime: 0,
              stopTime: 0,
            },
            mp4: {
              url: 'https://test-stream-mp4.test',
              duration: 0,
              startTime: 0,
              stopTime: 0,
            },
            m3u8: {
              url: 'https://test-stream-m3u8.test',
              duration: 0,
              startTime: 0,
              stopTime: 0,
            },
          },
        ],
        watcherUrl: {
          flv: {
            url: 'https://test-stream-flv.test',
            components: {
              origin: '1',
              appName: '2',
              streamName: '3',
              query: '4',
            },
          },
          hls: {
            url: 'https://test-stream-hls.test',
            components: {
              origin: '1',
              appName: '2',
              streamName: '3',
              query: '4',
            },
          },
          rtmp: {
            url: 'https://test-stream-rtmp.test',
            components: {
              origin: '1',
              appName: '2',
              streamName: '3',
              query: '4',
            },
          },
        },
      },
    ],
  },
};

export const streamsResponse = [
  {
    title: 'Deleted',
    description: 'Deleted',
    metadata: {},
    streamerUrl: {},
    watcherUrl: {},
    status: 'ended',
    isLive: false,
    isDeleted: true,
    startedAt: '2023-06-06T05:43:31.540Z',
    endedAt: '2023-06-06T07:21:54.298Z',
    resolution: 'HD',
    updatedAt: '2023-06-06T07:21:54.299Z',
    createdAt: '2023-06-06T05:43:21.633Z',
    streamId: '53d239a2d1b05f340ab0010d71e8b1a0',
    userId: 'DFonV53',
    thumbnailFileId: null,
    platform: {
      name: 'apsara',
      version: '2016-11-01',
    },
  },
  {
    title: 'Deleted',
    description: 'Deleted',
    metadata: {},
    streamerUrl: {},
    watcherUrl: {},
    status: 'ended',
    isLive: false,
    isDeleted: true,
    startedAt: '2023-06-06T04:14:34.066Z',
    endedAt: '2023-06-06T07:21:54.298Z',
    resolution: 'HD',
    updatedAt: '2023-06-06T07:21:54.299Z',
    createdAt: '2023-06-06T04:14:26.166Z',
    streamId: '9370a1f526389435946199e49428522d',
    userId: 'DFonV53',
    thumbnailFileId: null,
    platform: {
      name: 'apsara',
      version: '2016-11-01',
    },
  },
];
