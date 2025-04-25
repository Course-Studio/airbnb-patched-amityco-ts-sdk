export {};
declare global {
    namespace Amity {
        type LinkPreview = {
            title: string | null;
            description: string | null;
            image: string | null;
            video: string | null;
        };
    }
}
