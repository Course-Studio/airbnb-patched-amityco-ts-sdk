export declare const API_REGIONS: {
    readonly EU: "eu";
    readonly SG: "sg";
    readonly US: "us";
};
declare const URLS: {
    readonly http: "https://apix.{region}.amity.co";
    readonly upload: "https://upload.{region}.amity.co";
    readonly mqtt: "wss://sse.{region}.amity.co:443/mqtt";
};
export declare function computeUrl(type: keyof typeof URLS, region: string): string;
export {};
