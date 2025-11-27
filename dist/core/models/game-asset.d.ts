export type GameAssetRequest = {
    id: string;
    path: string;
    type: "IMAGE" | "AUDIO" | "JSON" | "TEXT";
};
