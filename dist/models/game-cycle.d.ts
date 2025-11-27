export interface GameCycle {
    init(...args: any): Promise<any>;
    update(deltaTime: number, ...args: any): Promise<any>;
    render(...args: any): any;
    clean(...args: any): any;
}
