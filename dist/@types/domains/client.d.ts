/// <reference types="socket.io-client" />
import { AxiosInstance } from 'axios';
import { Emitter } from 'mitt';
declare global {
    namespace Amity {
        type Logger = (topic: string, ...args: any[]) => void;
        const enum TokenTerminationReason {
            GLOBAL_BAN = "globalBan",
            USER_DELETED = "userDeleted",
            UNAUTHORIZED = "unauthorized"
        }
        const enum SessionStates {
            NOT_LOGGED_IN = "notLoggedIn",
            ESTABLISHING = "establishing",
            ESTABLISHED = "established",
            TOKEN_EXPIRED = "tokenExpired",
            TERMINATED = "terminated"
        }
        type Client = {
            version: string;
            log: Logger;
            http: AxiosInstance;
            upload: AxiosInstance;
            mqtt?: Amity.MqttClient;
            ws?: SocketIOClient.Socket;
            emitter: Emitter<Amity.Events>;
            hasPermission: (permission: string) => Amity.PermissionChecker;
            validateUrls: (urls: string[]) => Promise<boolean>;
            validateTexts: (texts: string[]) => Promise<boolean>;
            sessionState: Amity.SessionStates;
            sessionHandler?: Amity.SessionHandler;
            cache?: Amity.Cache;
            apiKey?: string;
            userId?: string;
            token?: Amity.Tokens;
            isUnreadCountEnabled: boolean;
            useLegacyUnreadCount: boolean;
            use: () => void;
            accessTokenExpiryWatcher: (sessionHandler: Amity.SessionHandler) => Amity.Unsubscriber;
            getFeedSettings: () => Promise<Amity.FeedSettings>;
            getSocialSettings: () => Promise<Amity.SocialSettings>;
            getMessagePreviewSetting: (refresh?: boolean) => Promise<Amity.MessagePreviewSetting>;
            getMarkerSyncConsistentMode: () => boolean;
            prefixDeviceIdKey?: string;
        };
        type Device = {
            deviceId: string;
            deviceInfo: {
                kind: 'node' | 'web';
                model?: string;
                sdkVersion: string;
            };
        };
        type Tokens = {
            accessToken: string;
            issuedAt: string;
            expiresAt: string;
        };
        type AccessTokenRenewal = {
            renew: () => void;
            renewWithAuthToken: (authToken: string) => void;
            unableToRetrieveAuthToken: () => void;
        };
        interface SessionHandler {
            sessionWillRenewAccessToken(renewal: AccessTokenRenewal): void;
        }
        type ChatSettings = {
            enabled: boolean;
            mention: {
                isAllowMentionedChannelEnabled: boolean;
            };
            messagePreview: {
                enabled: boolean;
                isIncludeDeleted: boolean;
            };
        };
        type FeedSettings = {
            [name in Amity.ContentFeedType]?: Amity.ContentSetting[];
        };
        type SocialSettings = {
            enabled: boolean;
            isAllowEditPostWhenReviewingEnabled: boolean;
            isFollowWithRequestEnabled: boolean;
            globalFeed: {
                showCommunityPost: boolean;
                showEveryonePost: boolean;
                showFollowingPost: boolean;
                showMyPost: boolean;
                showOnlyMyFeed: boolean;
            };
            userPrivacySetting: 'public' | 'private';
        };
        type ConnectClientParams = {
            userId: Amity.InternalUser['userId'];
            displayName?: Amity.InternalUser['displayName'];
            authToken?: string;
            deviceId?: Amity.Device['deviceId'];
        };
        type ConnectClientConfig = {
            disableRTE: boolean;
        };
        type ActiveUser = Pick<Amity.InternalUser, '_id' | 'userId' | 'path' | 'displayName'>;
        type UserUnread = Pick<Amity.UserMarker, 'unreadCount'> & {
            isMentioned: boolean;
        };
    }
}
//# sourceMappingURL=client.d.ts.map