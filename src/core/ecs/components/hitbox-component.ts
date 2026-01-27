import {
  BoundingBox,
  EcsComponent,
  EcsEntity,
  HitboxColor,
  Vec2,
} from "hypertoroid";
import { HTMLEventType } from "../../types/html-event-type";

export type HitboxData = {
  isDragging: boolean;
};
export type HitTestFn = (
  point: Vec2<number>,
  ctx: OffscreenCanvasRenderingContext2D,
) => boolean;

export type Callback<K extends keyof HTMLElementEventMap> = (
  ev: HTMLElementEventMap[K],
) => any;

export type HTMLEventCallback = Partial<{
  [key in HTMLEventType]: Callback<key>;
}>;

export class HitboxComponent extends EcsComponent {
  constructor(
    public id: EcsEntity,
    public layer?: number, // 0-100, higher = higher priority. Defaults to 0.
    public callbacks?: HTMLEventCallback,
    public data?: Partial<HitboxData>,
    // Spatial definition (at least one should be provided)
    public getBoundingBox?: () => BoundingBox<number> | undefined,
    public hitTest?: HitTestFn,
    public color?: HitboxColor,
    public image?: HTMLImageElement,
  ) {
    super();
  }
}
