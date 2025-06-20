export declare const streamResponse: {
    data: {
        videoStreamings: {
            streamId: string;
            userId: string;
            thumbnailFileId: string;
            title: string;
            status: string;
            isLive: boolean;
            isDeleted: boolean;
            description: string;
            platform: {
                name: string;
                version: string;
            };
            startedAt: string;
            endedAt: string;
            createdAt: string;
            updatedAt: string;
            metadata: {};
            resolution: string;
            streamerUrl: {
                url: string;
                components: {
                    origin: string;
                    appName: string;
                    streamName: string;
                    query: string;
                };
            };
            recordings: {
                flv: {
                    url: string;
                    duration: number;
                    startTime: number;
                    stopTime: number;
                };
                mp4: {
                    url: string;
                    duration: number;
                    startTime: number;
                    stopTime: number;
                };
                m3u8: {
                    url: string;
                    duration: number;
                    startTime: number;
                    stopTime: number;
                };
            }[];
            watcherUrl: {
                flv: {
                    url: string;
                    components: {
                        origin: string;
                        appName: string;
                        streamName: string;
                        query: string;
                    };
                };
                hls: {
                    url: string;
                    components: {
                        origin: string;
                        appName: string;
                        streamName: string;
                        query: string;
                    };
                };
                rtmp: {
                    url: string;
                    components: {
                        origin: string;
                        appName: string;
                        streamName: string;
                        query: string;
                    };
                };
            };
        }[];
    };
};
export declare const streamsResponse: {
    title: string;
    description: string;
    metadata: {};
    streamerUrl: {};
    watcherUrl: {};
    status: string;
    isLive: boolean;
    isDeleted: boolean;
    startedAt: string;
    endedAt: string;
    resolution: string;
    updatedAt: string;
    createdAt: string;
    streamId: string;
    userId: string;
    thumbnailFileId: any;
    platform: {
        name: string;
        version: string;
    };
}[];
