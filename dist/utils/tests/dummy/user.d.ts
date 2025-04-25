export declare const user11: Amity.User;
export declare const user12: Amity.User;
export declare const user13: Amity.User;
export declare const user14: Amity.User;
export declare const user21: Amity.User;
export declare const user22: Amity.User;
export declare const viewedUserQueryResponse: {
    data: {
        users: Amity.User[];
        files: never[];
        paging: {};
    };
};
export declare const userQueryResponse: {
    data: {
        users: Amity.User[];
        files: never[];
        paging: {
            previous: string;
            next: string;
        };
    };
};
export declare const userQueryResponsePage2: {
    data: {
        users: Amity.User[];
        files: never[];
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
    displayName?: string | undefined;
    avatarFileId?: string | undefined;
    avatarCustomUrl?: string | undefined;
    description?: string | undefined;
    isBrand: boolean;
    isGlobalBan: boolean;
    metadata?: Record<string, any> | undefined;
    tags?: string[] | undefined;
    hashFlag: {
        bits: number;
        hashes: number;
        hash: string;
    } | null;
    roles: string[];
    permissions: Amity.Permission[];
    createdAt: string;
    updatedAt?: string | undefined;
    deletedAt?: string | undefined;
    isDeleted?: boolean | undefined;
    path: string;
    isGlobalBanned: boolean;
    avatar?: Amity.File<"image"> | null | undefined;
};
export declare const flaggedUserQueryResponse: {
    data: {
        users: {
            userId: string;
            flagCount: number;
            _id: string;
            userInternalId: string;
            userPublicId: string;
            displayName?: string | undefined;
            avatarFileId?: string | undefined;
            avatarCustomUrl?: string | undefined;
            description?: string | undefined;
            isBrand: boolean;
            isGlobalBan: boolean;
            metadata?: Record<string, any> | undefined;
            tags?: string[] | undefined;
            hashFlag: {
                bits: number;
                hashes: number;
                hash: string;
            } | null;
            roles: string[];
            permissions: Amity.Permission[];
            createdAt: string;
            updatedAt?: string | undefined;
            deletedAt?: string | undefined;
            isDeleted?: boolean | undefined;
            path: string;
            isGlobalBanned: boolean;
            avatar?: Amity.File<"image"> | null | undefined;
        }[];
        files: never[];
    };
};
export declare const userUpdateResponse: {
    data: {
        users: {
            isDeleted: boolean;
            displayName: string;
            userId: string;
            metadata: {};
            roles: never[];
            permissions: never[];
            flagCount: number;
            hashFlag: null;
            avatarCustomUrl: string;
            avatarFileId: null;
            isGlobalBanned: boolean;
        }[];
        files: never[];
    };
};
export declare const users: Amity.User[];
export declare const userPayload: Amity.UserPayload;
//# sourceMappingURL=user.d.ts.map