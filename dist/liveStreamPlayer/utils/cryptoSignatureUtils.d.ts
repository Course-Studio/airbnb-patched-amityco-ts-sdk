export declare function createSignature({ timestamp, streams, }: {
    timestamp: string;
    streams: Amity.UsageDataModel[];
}): Promise<{
    signature: string;
    nonceStr: string;
}>;
