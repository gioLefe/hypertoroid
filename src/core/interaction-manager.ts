import { isPointInAlignedBBox } from "../helpers";
import { BoundingBox, Vec2 } from "../models";
import {
  Color,
  colorize,
  colorToString,
  getCtxPixelColor,
  isSameColor,
} from "../models/color";
import { EventType } from "./types/event-type";

export type HitTestFn = (
  point: Vec2<number>,
  ctx: OffscreenCanvasRenderingContext2D
) => boolean;

export type Callback<K extends keyof HTMLElementEventMap> = (
  ev: HTMLElementEventMap[K]
) => any;

export type EventCallback = Partial<{
  [key in EventType]: Callback<key>;
}>;

export type HitBoxColor = Color & {
  a: 255; // Ensure fully opaque for hitbox rendering
};

/**
 * Unified hitbox + event definition.
 * Spatial hitbox with optional event callbacks and priority layer.
 */
export type HitboxEvent = {
  id: string;
  layer?: number; // 0-100; higher = higher priority. Defaults to 0.

  // Spatial definition (at least one should be provided)
  boundingBox?: () => BoundingBox<number> | undefined;
  hitTest?: HitTestFn;
  color?: HitBoxColor;
  image?: HTMLImageElement;

  // Event callbacks
  callbacks?: EventCallback;
};

export type HitboxEventId = string;

export class InteractionManager {
  static INTERACTION_MANAGER_ID = "InteractionManager";

  private canvas: HTMLCanvasElement;
  private hitboxEvents = new Map<HitboxEventId, HitboxEvent>();
  private hitboxArray: HitboxEvent[] | null = null;
  private hitBoxCanvas: OffscreenCanvas = new OffscreenCanvas(0, 0);
  private hitBoxOffscreenCtx: OffscreenCanvasRenderingContext2D =
    this.hitBoxCanvas.getContext("2d", { willReadFrequently: true })!;
  private colorizedCache = new Map<string, OffscreenCanvas>();

  private keyboardFocusId: string | null = null;
  private mouseMoveTargetId: string | null = null;
  private mouseOutCallback: Callback<"mouseout"> | null = null;
  private mouseDownTargetId: string | null = null;
  private mouseUpCallback: Callback<"mouseup"> | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.updateCanvasSize(canvas.width, canvas.height);
  }

  registerEventListener(
    evType: EventType,
    options?: boolean | AddEventListenerOptions
  ) {
    this.canvas.addEventListener(evType, this.listener, options);
  }

  /**
   * Query the highest-priority hitbox at a point.
   * Returns undefined if no hitbox matches.
   */
  getHitboxAt(point: Vec2<number>): HitboxEvent | undefined {
    const candidates = this.getHitboxArray().filter((hb) =>
      this.hitTest(hb, point)
    );

    if (candidates.length === 0) return undefined;

    // Sort by layer (highest first) and return the winner
    return candidates.sort((a, b) => (b.layer ?? 0) - (a.layer ?? 0))[0];
  }

  updateCanvasSize(width: number, height: number) {
    this.hitBoxCanvas.width = width;
    this.hitBoxCanvas.height = height;
  }

  registerKeyboardFocus(id: string) {
    this.keyboardFocusId = id;
  }
  deregisterKeyboardFocus() {
    this.keyboardFocusId = null;
  }

  // CRUD
  upsertHitbox(id: string, options: Partial<HitboxEvent>): void {
    const existing = this.hitboxEvents.get(id);
    this.hitboxEvents.set(id, {
      id,
      layer: options.layer ?? existing?.layer ?? 0,
      boundingBox: options.boundingBox ?? existing?.boundingBox,
      hitTest: options.hitTest ?? existing?.hitTest,
      color: options.color ?? existing?.color,
      image: options.image ?? existing?.image,
      callbacks: options.callbacks ?? existing?.callbacks,
    });
    this.hitboxArray = null;
  }
  removeHitbox(id: string): void {
    this.hitboxEvents.delete(id);
    this.hitboxArray = null;
  }
  hasHitBox(hbId: string): boolean {
    return this.hitboxEvents.has(hbId);
  }

  /**
   * Renders hitboxes to the offscreen canvas, sorted by layer priority.
   * This offscreen canvas is used by hitTest() for pixel-perfect collision detection.
   * Higher layer values are rendered last (on top), ensuring they win priority queries.
   */
  render(
    ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D = this
      .hitBoxOffscreenCtx
  ) {
    if (!ctx) return;

    ctx.clearRect(0, 0, this.hitBoxCanvas.width, this.hitBoxCanvas.height);

    // Sort by layer and render in order (lowest to highest)
    const sortedByLayer = this.getHitboxArray().sort(
      (a, b) => (a.layer ?? 0) - (b.layer ?? 0)
    );

    for (const hitboxEvent of sortedByLayer) {
      const bbox = hitboxEvent.boundingBox?.();
      if (!bbox || !hitboxEvent.color) continue;

      if (hitboxEvent.image) {
        const colorized = this.colorizeCached(
          hitboxEvent.image,
          hitboxEvent.color
        );
        ctx.drawImage(colorized, bbox.nw.x, bbox.nw.y);
        continue;
      }

      const colorString = colorToString(hitboxEvent.color);
      ctx.fillStyle = colorString;
      ctx.strokeStyle = colorString;
      ctx.fillRect(
        bbox.nw.x,
        bbox.nw.y,
        bbox.se.x - bbox.nw.x,
        bbox.se.y - bbox.nw.y
      );
    }
  }

  clean(evTypes: EventType[]): void {
    for (const evType of evTypes) {
      this.canvas.removeEventListener(evType, this.listener);
    }
    this.hitboxEvents.clear();
    this.hitboxArray = null;
  }

  private listener: EventListener = <K extends EventType>(
    htmlEv: HTMLElementEventMap[K]
  ) => {
    const evType = htmlEv.type as K;

    // Keyboard events: dispatch to all listeners
    if (evType.indexOf("key") === 0) {
      // If something has focus, only it receives the event
      if (this.keyboardFocusId) {
        const focused = this.hitboxEvents.get(this.keyboardFocusId);
        const callback = focused?.callbacks?.[evType];
        if (callback) {
          callback(htmlEv);
        }
        return; // Don't bubble to other listeners
      }

      const canvasHitBox = this.getCanvasEvent(evType);
      if (canvasHitBox) {
        canvasHitBox.callbacks?.[evType]?.(htmlEv);
      }
    }
    const point = this.extractPoint(htmlEv);
    if (!point) return;

    // Mouse/pointer events: find highest-priority hitbox and invoke only that
    let hitBoxEvent = this.getHitboxAt(point);
    if (!hitBoxEvent) {
      // No hitbox found; call global callbacks on canvas (if any registered)
      hitBoxEvent = this.getCanvasEvent(evType);
    }

    if (!hitBoxEvent) return;

    const callback = hitBoxEvent.callbacks?.[evType];
    if (callback) {
      callback(htmlEv);
    }

    this.handleMouseButtonRelease(htmlEv, evType, hitBoxEvent);
    this.handleMouseOut(htmlEv, evType, hitBoxEvent);
  };

  private extractPoint(
    ev: HTMLElementEventMap[keyof HTMLElementEventMap]
  ): Vec2<number> | null {
    if ("offsetX" in ev && "offsetY" in ev) {
      return { x: ev.offsetX, y: ev.offsetY };
    }
    return null;
  }

  private hitTest(hitboxEvent: HitboxEvent, point: Vec2<number>): boolean {
    // bbox test first
    if (hitboxEvent.boundingBox) {
      const bbox = hitboxEvent.boundingBox();
      if (!bbox || !isPointInAlignedBBox(point, bbox)) {
        return false;
      }
    }

    // custom hit test
    if (hitboxEvent.hitTest) {
      return hitboxEvent.hitTest(point, this.hitBoxOffscreenCtx);
    }

    // color-based (offscreen canvas pixel-perfect)
    if (hitboxEvent.color) {
      const pixel = getCtxPixelColor(point.x, point.y, this.hitBoxOffscreenCtx);
      return isSameColor(pixel, hitboxEvent.color);
    }

    // bbox passed or no constraints
    return hitboxEvent.boundingBox !== undefined;
  }

  private colorizeCached(
    image: HTMLImageElement,
    color: Color
  ): OffscreenCanvas {
    const key = `${image.src}:${color.r},${color.g},${color.b},${color.a}`;
    let cached = this.colorizedCache.get(key);
    if (!cached) {
      cached = colorize(image, color.r, color.g, color.b);
      this.colorizedCache.set(key, cached);
    }
    return cached;
  }

  private getHitboxArray(): HitboxEvent[] {
    if (!this.hitboxArray) {
      this.hitboxArray = Array.from(this.hitboxEvents.values());
    }
    return this.hitboxArray;
  }

  private getCanvasEvent(evType: EventType): HitboxEvent | undefined {
    if (!this.hitboxArray) {
      return undefined;
    }
    return this.hitboxArray?.find((hb) => {
      return (
        hb.boundingBox === undefined &&
        hb.hitTest === undefined &&
        hb.color === undefined &&
        hb.image === undefined &&
        hb.callbacks?.[evType]
      );
    });
  }

  /** Handle mouse button release across different hitboxes.
   * Ensures that if a mousedown occurs on one hitbox and mouseup on another,
   * the original hitbox's mouseup callback is still invoked.
   */
  private handleMouseButtonRelease = (
    htmlEv: HTMLElementEventMap[keyof HTMLElementEventMap],
    evType: EventType,
    hitBoxEvent: HitboxEvent
  ) => {
    if (evType === "mousedown" && this.mouseUpCallback === null) {
      this.mouseUpCallback = hitBoxEvent.callbacks?.["mouseup"] || null;
      this.mouseDownTargetId = hitBoxEvent.id || null;
    }

    if (evType === "mouseup" && this.mouseUpCallback) {
      if (this.mouseDownTargetId !== hitBoxEvent.id) {
        this.mouseUpCallback(htmlEv as HTMLElementEventMap["mouseup"]);
        this.mouseDownTargetId = null;
        this.mouseUpCallback = null;
      }
    }
  };

  /** Handle mouse hover and mouseout across different hitboxes.
   * Ensures that if a mousedown occurs on one hitbox and mouseup on another,
   * the original hitbox's mouseup callback is still invoked.
   */
  private handleMouseOut = (
    htmlEv: HTMLElementEventMap[keyof HTMLElementEventMap],
    evType: EventType,
    hitBoxEvent: HitboxEvent
  ) => {
    if (evType === "mousemove" && this.mouseOutCallback === null) {
      this.mouseOutCallback = hitBoxEvent.callbacks?.["mouseout"] || null;
      this.mouseMoveTargetId = hitBoxEvent.id || null;
    }

    if (evType === "mousemove" && this.mouseOutCallback) {
      if (this.mouseMoveTargetId !== hitBoxEvent.id) {
        this.mouseOutCallback(htmlEv as HTMLElementEventMap["mouseout"]);
        this.mouseMoveTargetId = null;
        this.mouseOutCallback = null;
      }
    }
  };

  /**
   * Query all hitboxes at a point, sorted by priority (highest first).
   */
  // getHitboxesAt(point: Vec2<number>): HitboxEvent[] {
  //   return this.getHitboxArray()
  //     .filter((hb) => this.hitTest(hb, point))
  //     .sort((a, b) => (b.layer ?? 0) - (a.layer ?? 0));
  // }
}
