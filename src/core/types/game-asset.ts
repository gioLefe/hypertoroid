export type AssetType = "IMAGE" | "AUDIO" | "JSON" | "TEXT";
export type GameAssetRequest = {
  id: string;
  path: string;
  assetType: AssetType;
};
