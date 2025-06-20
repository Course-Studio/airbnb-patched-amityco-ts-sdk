export {};
declare global {
    type Writeable<T> = {
        -readonly [P in keyof T]: T[P];
    };
    type Patch<T, K extends keyof T> = Partial<Pick<T, K>>;
    type Unwrap<T> = T extends Promise<infer U> ? U : T extends (...args: any) => Promise<infer U> ? U : T extends (...args: any) => infer U ? U : T;
    type ObjectKeys<T> = T extends object ? (keyof T)[] : T extends number ? [] : T extends Array<any> | string ? string[] : never;
    interface ObjectConstructor {
        keys<T>(o: T): ObjectKeys<T>;
    }
    type ValueOf<T extends Record<any, any>> = T[keyof T];
    /**
     *  Make properties required otherwise optional
     */
    type MakeRequired<T, K extends keyof T> = Required<Pick<T, K>> & Partial<T>;
    /**
     *  Make properties optional otherwise required
     */
    type MakeOptional<T, K extends keyof T> = Partial<Pick<T, K>> & Required<T>;
}
declare module 'axios' {
    interface MetaData {
        tokenExpiry: string;
        isGlobalBanned: boolean;
        isUserDeleted: boolean;
    }
    interface AxiosDefaults {
        metadata?: MetaData;
    }
    interface AxiosRequestConfig {
        metadata?: MetaData;
    }
}
