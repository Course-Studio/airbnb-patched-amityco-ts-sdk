export declare class GlobalFileAccessType {
    #private;
    setFileAccessType(fileAccessType: Amity.FileAccessType): void;
    getFileAccessType(): "public" | "network";
}
declare const _default: {
    getInstance: () => GlobalFileAccessType;
};
export default _default;
