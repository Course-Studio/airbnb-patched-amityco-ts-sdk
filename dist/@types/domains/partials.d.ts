export {};
declare global {
    namespace Amity {
        type timestamp = string;
        const enum SyncState {
            Synced = "synced",
            Syncing = "syncing",
            Error = "error"
        }
        type ImageDisplayMode = 'fit' | 'fill';
        type CreatedAt = {
            createdAt: timestamp;
        };
        type UpdatedAt = {
            updatedAt?: timestamp;
        };
        type DeletedAt = {
            deletedAt?: timestamp;
        };
        type ExpiresAt = {
            expiresAt?: timestamp;
        };
        type SyncAt = {
            lastSyncAt: timestamp;
        };
        type Timestamps = CreatedAt & UpdatedAt;
        type SoftDelete = DeletedAt & {
            isDeleted?: boolean;
        };
        type Metadata = {
            metadata?: Record<string, any>;
        };
        type Relationship<T extends string> = {
            referenceId: string;
            referenceType: T;
        };
        type Flaggable = {
            flagCount: number;
            hashFlag: {
                bits: number;
                hashes: number;
                hash: string;
            } | null;
        };
        type Taggable = {
            tags?: string[];
        };
        type Accredited = {
            roles: Amity.Role['displayName'][];
            permissions: Amity.Permission[];
        };
        type Subscribable = {
            path: string;
        };
        type IsMentioned = {
            isMentioned: boolean;
        };
    }
}
