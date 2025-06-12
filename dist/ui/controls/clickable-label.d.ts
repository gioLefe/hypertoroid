import { EventCallback } from "../with-events";
import { UILabel } from "./label";
declare const UIClickableLabel_base: import("../..").AnonymousClass<import("../with-events").WithEvents> & typeof UILabel;
export declare class UIClickableLabel extends UIClickableLabel_base {
    protected mouseOver: boolean;
    private mouseEnterCallbacks;
    private mouseLeaveCallbacks;
    init(canvas: HTMLCanvasElement, ..._args: any): void;
    clean(..._args: any): void;
    addMouseEnterCallback: (ev: EventCallback) => void;
    addMouseLeaveCallback: (ev: EventCallback) => void;
    private playBtnMouseEnter;
    private playBtnMouseLeave;
}
export {};
