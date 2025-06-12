export interface GameCycle {
  init(...args: any): any;
  update(deltaTime: number, ...args: any): any;
  render(...args: any): any;
  clean(...args: any): any;
}
