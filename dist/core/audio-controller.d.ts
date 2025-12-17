import { AudioPlayingOptions } from "./types/audio-playing-options";
export declare class AudioController {
    static AUDIO_CONTROLLER_DI: string;
    private assetsManager;
    private audioContext;
    private mainGainNode;
    private playingSounds;
    constructor();
    get playingAssetsIds(): string[];
    setMainVolume(value: number): void;
    getMainVolume(): number;
    playAsset(id: string, audioPlayingOptions?: AudioPlayingOptions): void;
}
//# sourceMappingURL=audio-controller.d.ts.map