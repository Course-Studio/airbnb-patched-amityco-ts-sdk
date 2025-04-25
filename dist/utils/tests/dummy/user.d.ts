export declare const user11: Amity.User;
export declare const user12: Amity.User;
export declare const user13: Amity.User;
export declare const user14: Amity.User;
export declare const user21: Amity.User;
export declare const user22: Amity.User;
export declare const viewedUserQueryResponse: {
    data: {
        users: Amity.User[];
        files: any[];
        paging: {};
    };
};
export declare const userQueryResponse: {
    data: {
        users: Amity.User[];
        files: any[];
        paging: {
            previous: string;
            next: string;
        };
    };
};
export declare const userQueryResponsePage2: {
    data: {
        users: Amity.User[];
        files: any[];
        paging: {
            previous: string;
            next: string;
        };
    };
};
export declare const flaggedUser: {
    userId: string;
    flagCount: number;
    _id: string;
    userInternalId: string;
    userPublicId: string;
    displayName?: string;
    avatarFileId?: string;
    avatarCustomUrl?: string;
    description?: string;
    isBrand: boolean;
    isGlobalBan: boolean;
    metadata?: Record<string, any>;
    tags?: string[];
    hashFlag: {
        bits: number;
        hashes: number;
        hash: string;
    };
    roles: string[];
    permissions: Amity.Permission[];
    createdAt: string;
    updatedAt?: string;
    deletedAt?: string;
    isDeleted?: boolean;
    path: string;
    isGlobalBanned: boolean;
    avatar?: Amity.File<"image">;
};
export declare const flaggedUserQueryResponse: {
    data: {
        users: {
            userId: string;
            flagCount: number;
            _id: string;
            userInternalId: string;
            userPublicId: string;
            displayName?: string;
            avatarFileId?: string;
            avatarCustomUrl?: string;
            description?: string;
            isBrand: boolean;
            isGlobalBan: boolean;
            metadata?: Record<string, any>;
            tags?: string[];
            hashFlag: {
                bits: number;
                hashes: number;
                hash: string;
            };
            roles: string[];
            permissions: Amity.Permission[];
            createdAt: string;
            updatedAt?: string;
            deletedAt?: string;
            isDeleted?: boolean;
            path: string;
            isGlobalBanned: boolean;
            avatar?: Amity.File<"image">;
        }[];
        files: any[];
    };
};
export declare const userUpdateResponse: {
    data: {
        users: {
            isDeleted: boolean;
            displayName: string;
            userId: string;
            metadata: {};
            roles: any[];
            permissions: any[];
            flagCount: number;
            hashFlag: any;
            avatarCustomUrl: string;
            avatarFileId: any;
            isGlobalBanned: boolean;
        }[];
        files: any[];
    };
};
export declare const users: Amity.User[];
export declare const userPayload: Amity.UserPayload;
