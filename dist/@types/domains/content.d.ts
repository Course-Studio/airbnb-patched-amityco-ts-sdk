export declare const ContentFeedType: Readonly<{
    STORY: "story";
    CLIP: "clip";
    CHAT: "chat";
    POST: "post";
    MESSAGE: "message";
}>;
declare global {
    namespace Amity {
        type ContentType = 'text' | 'image' | 'file' | 'video' | 'poll' | 'json' | string;
        type ContentFeedType = ValueOf<typeof ContentFeedType>;
        type ContentDataText = {
            text: string;
        };
        type ContentDataFile = {
            fileId: Amity.File<'file'>['fileId'];
        };
        type ContentDataImage = {
            fileId: Amity.File<'image'>['fileId'];
            caption?: string;
        };
        type Attachment = {
            type: 'image' | 'link';
            url?: string;
            fileId?: Amity.File<'image'>['fileId'];
        };
        type ContentDataVideo = {
            thumbnailFileId: Amity.File<'image'>['fileId'];
            videoFileId: {
                [K in Amity.VideoSize]?: Amity.File<'video'>['fileId'];
            };
        };
        type ContentDataPoll = {
            pollId: Amity.Poll['pollId'];
        };
        type ContentData<T extends ContentType> = T extends 'text' ? ContentDataText : T extends 'file' ? ContentDataFile : T extends 'image' ? ContentDataImage : T extends 'video' ? ContentDataVideo : T extends 'poll' ? ContentDataPoll : T extends 'json' ? Record<string, unknown> : T extends string ? string | Record<string, unknown> : never;
        type Content<T extends ContentType> = {
            dataType?: T;
            dataTypes?: T[];
            data?: ContentData<T>;
        };
        type ContentSettingText = {
            contentType: 'text';
            allowed: boolean;
        };
        type ContentSettingVideo = {
            contentType: 'video';
            allowed: boolean;
            maxDurationSeconds: number;
            transcodeConfig: {
                maxResolution: Amity.VideoResolution;
                minResolution: Amity.VideoResolution;
            };
        };
        type ContentSetting<T extends ContentType = 'text' | 'video'> = T extends 'text' ? ContentSettingText : T extends 'video' ? ContentSettingVideo : never;
    }
}
