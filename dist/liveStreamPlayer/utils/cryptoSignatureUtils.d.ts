export declare function createSignature({ timestamp, streams, }: {
    timestamp: string;
    streams: Amity.UsageDataModel[];
}): Promise<{
    signature: string;
    nonceStr: string | number[];
} | undefined>;
//# sourceMappingURL=cryptoSignatureUtils.d.ts.map