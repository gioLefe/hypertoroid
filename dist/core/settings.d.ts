export declare const CANVAS_WIDTH = "canvasW";
export declare const CANVAS_HEIGHT = "canvasH";
export declare class Settings {
    static SETTINGS_DI: string;
    private settings;
    get<T extends unknown>(key: string): T | undefined;
    set<T extends unknown>(key: string, value: T): void;
}
