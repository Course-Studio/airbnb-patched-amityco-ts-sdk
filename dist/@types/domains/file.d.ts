export declare const FileType: Readonly<{
    FILE: "file";
    IMAGE: "image";
    VIDEO: "video";
}>;
export declare const VideoResolution: Readonly<{
    '1080P': "1080p";
    '720P': "720p";
    '480P': "480p";
    '360P': "360p";
    ORIGINAL: "original";
}>;
export declare const VideoTranscodingStatus: Readonly<{
    UPLOADED: "uploaded";
    TRANSCODING: "transcoding";
    TRANSCODED: "transcoded";
    TRANSCODE_FAILED: "transcodeFailed";
}>;
export declare const VideoSize: Readonly<{
    LOW: "low";
    MEDIUM: "medium";
    HIGH: "high";
    ORIGINAL: "original";
}>;
export declare enum FileAccessTypeEnum {
    PUBLIC = "public",
    NETWORK = "network"
}
declare global {
    namespace Amity {
        type FileAccessType = `${FileAccessTypeEnum}`;
        type FileType = ValueOf<typeof FileType>;
        type VideoResolution = ValueOf<typeof VideoResolution>;
        type VideoTranscodingStatus = ValueOf<typeof VideoTranscodingStatus>;
        type VideoSize = ValueOf<typeof VideoSize>;
        type FileMetadata = Record<string, never>;
        type ImageMetadata = {
            exif: Record<string, unknown>;
            gps: Record<string, unknown>;
            width: number;
            height: number;
            isFull: boolean;
        };
        type VideoMetadata = Record<string, never>;
        type MetadataFor<T extends FileType> = T extends 'file' ? FileMetadata : T extends 'image' ? ImageMetadata : T extends 'video' ? VideoMetadata : never;
        type VideoFileExtraPayload = {
            feedType: Amity.ContentFeedType;
            status: VideoTranscodingStatus;
            videoUrl?: {
                [name in VideoResolution]?: string;
            } | null;
        };
        type File<T extends FileType = any> = {
            fileId: string;
            type: T;
            fileUrl: string;
            attributes: {
                name: string;
                extension: string;
                size: string;
                mimeType: string;
                metadata: MetadataFor<T>;
            };
            accessType: FileAccessType;
        } & (T extends 'video' ? VideoFileExtraPayload : unknown) & Amity.Timestamps & Amity.SoftDelete;
    }
}
