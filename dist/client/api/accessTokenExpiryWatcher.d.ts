export declare const isExpired: (expiresAt: Amity.Tokens["expiresAt"]) => boolean;
export declare const isAboutToExpire: (params: {
    expiresAt: Amity.Tokens["expiresAt"];
    issuedAt: Amity.Tokens["issuedAt"];
}) => boolean;
export declare const accessTokenExpiryWatcher: (sessionHandler: Amity.SessionHandler) => Amity.Unsubscriber;
