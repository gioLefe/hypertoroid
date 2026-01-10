export const CANVAS_WIDTH = "canvasW";
export const CANVAS_HEIGHT = "canvasH";
export const GAME_LOOP_TIME = "gameLoopTime";

export class Settings {
  static SETTINGS_DI = "settings";
  
  private settings = new Map<string, unknown>();

  get<T extends unknown>(key: string): T | undefined {
    if (!this.settings.has(key)) {
      return undefined;
    }
    return this.settings.get(key) as T;
  }

  set<T extends unknown>(key: string, value: T): void {
    this.settings = this.settings.set(key, value);
  }
}
