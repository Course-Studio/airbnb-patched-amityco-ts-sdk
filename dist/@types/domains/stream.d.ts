export {};
declare global {
    namespace Amity {
        const enum StreamStatus {
            IDLE = "idle",
            LIVE = "live",
            ENDED = "ended",
            RECORDED = "recorded"
        }
        const enum StreamResolution {
            SD = "SD",
            HD = "HD",
            FHD = "FHD"
        }
        type MultiFormat<T> = {
            flv?: T;
            mp4?: T;
            hls?: T;
            m3u8?: T;
        };
        type StreamPlatform = {
            name: string;
            version: string;
        };
        type StreamEndpoint = {
            url: string;
            components: {
                origin: string;
                appName: string;
                streamName: string;
                query: string;
            };
        };
        type StreamRecording = {
            url: string;
            duration: number;
            startTime: number;
            stopTime: number;
        };
        type RawStream = {
            streamId: string;
            title: string;
            thumbnailFileId?: Amity.File<'image'>['fileId'];
            description?: string;
            status: StreamStatus;
            platform: StreamPlatform;
            isLive?: boolean;
            endedAt: Amity.timestamp;
            startedAt: Amity.timestamp;
            userId: Amity.InternalUser['userId'];
            resolution: StreamResolution;
            streamerUrl: StreamEndpoint;
            watcherUrl: MultiFormat<StreamEndpoint>;
            recordings: MultiFormat<StreamRecording>[];
            referenceId?: string;
            referenceType?: string;
            targetId?: string;
            targetType?: string;
        } & Amity.Metadata & Amity.Timestamps & Amity.SoftDelete;
        type InternalStream = RawStream;
        type StreamLinkedObject = {
            moderation?: Amity.StreamModeration;
        };
        type Stream = Amity.InternalStream & Amity.StreamLinkedObject;
        type QueryStreams = {
            isLive?: boolean;
            statuses?: Amity.StreamStatus[];
            userPublicIds?: Amity.InternalUser['userId'][];
            sortBy?: 'lastCreated' | 'firstCreated';
            isDeleted?: Amity.InternalStream['isDeleted'];
            page?: string;
            limit?: number;
        };
        type StreamModerationLabel = {
            categoryId: string;
            detectedAt: Amity.timestamp;
        };
        type StreamModeration = {
            moderationId: string;
            streamId: Amity.InternalStream['streamId'];
            flagLabels: Amity.StreamModerationLabel[];
            terminateLabels: Amity.StreamModerationLabel[];
            createdAt: Amity.timestamp;
            updatedAt: Amity.timestamp;
        };
        type StreamLiveCollection = Amity.LiveCollectionParams<Omit<QueryStreams, 'page'>>;
        type StreamLiveCollectionCache = Amity.LiveCollectionCache<Amity.InternalStream['streamId'], Pick<QueryStreams, 'page'>>;
        type StreamActionType = 'onStreamRecorded' | 'onStreamStarted' | 'onStreamStopped';
    }
}
