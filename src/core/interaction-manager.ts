import { ColorHeap, isPointInAlignedBBox } from "../helpers";
import { getCtxPixelColor, isSameColor, Vec2 } from "../models";
import {
  Callback,
  CanvasHitboxTagComponent,
  ECS,
  EcsEntity,
  HitboxComponent,
  KeyboardFocusTagComponent,
} from "./ecs";
import { MouseDownTagComponent } from "./ecs/components/mouse-down-tag-component";
import { HTMLEventType } from "./types";

export class InteractionManager {
  static INSTANCE_ID = "InteractionManager";

  private canvas: HTMLCanvasElement;
  private hitBoxCanvas: OffscreenCanvas = new OffscreenCanvas(0, 0);
  private colorizedCache = new Map<string, OffscreenCanvas>();

  private mouseMoveTargetId: EcsEntity | null = null;
  private mouseOutCallback: Callback<"mouseout"> | null = null;
  private mouseDownTargetId: EcsEntity | null = null;
  private mouseUpCallback: Callback<"mouseup"> | null = null;
  private _point: Vec2<number> = { x: 0, y: 0 };

  colorHeap = new ColorHeap();
  hitBoxOffscreenCtx: OffscreenCanvasRenderingContext2D =
    this.hitBoxCanvas.getContext("2d", { willReadFrequently: true })!;

  constructor(
    canvas: HTMLCanvasElement,
    private ecs: ECS,
  ) {
    this.canvas = canvas;
    this.updateCanvasSize(canvas.width, canvas.height);
  }

  registerEventListener(
    evType: HTMLEventType,
    options?: boolean | AddEventListenerOptions,
  ) {
    this.canvas.addEventListener(evType, this.listener, options);
  }

  registerKeyboardFocus(entity: EcsEntity) {
    const entities = this.ecs.findEntitiesByComponent(
      KeyboardFocusTagComponent,
    );
    if (entities.length) {
      this.ecs.removeComponent(entities[0], KeyboardFocusTagComponent);
    }
    this.ecs.addComponent(entity, new KeyboardFocusTagComponent());
  }

  updateCanvasSize(width: number, height: number): void {
    this.hitBoxCanvas.width = width;
    this.hitBoxCanvas.height = height;
  }

  clean(evTypes: HTMLEventType[]): void {
    for (const evType of evTypes) {
      this.canvas.removeEventListener(evType, this.listener);
    }
    this.colorizedCache.clear();
  }

  private listener: EventListener = <K extends HTMLEventType>(
    htmlEv: HTMLElementEventMap[K],
  ) => {
    const evType = htmlEv.type as K;

    // Keyboard events: dispatch to all listeners
    if (evType.indexOf("key") === 0) {
      // If something has focus, only it receives the event
      const entity = this.ecs.findEntitiesByComponent(
        KeyboardFocusTagComponent,
      );
      console.log(`entity:`, entity[0]);
      if (entity.length) {
        const components = this.ecs.getComponents(entity[0]);

        const focusedHitbox = components?.get(HitboxComponent);
        const callback = focusedHitbox?.callbacks?.[evType];
        if (callback) {
          callback(htmlEv);
        }
        return; // Don't bubble to other listeners
      }

      const canvasHitBox = this.getCanvasHitbox(evType);
      if (canvasHitBox) {
        canvasHitBox.callbacks?.[evType]?.(htmlEv);
      }
    }
    this.extractPoint(htmlEv, this._point);
    if (!this._point) return;

    // Mouse/pointer events: find highest-priority hitbox and invoke only that
    let hitBoxComponent = this.getHitboxAt(this._point);
    if (!hitBoxComponent) {
      // No hitbox found; call global callbacks on canvas (if any registered)
      hitBoxComponent = this.getCanvasHitbox(evType);
    }
    if (!hitBoxComponent) return;

    const callback = hitBoxComponent.callbacks?.[evType];
    if (callback) {
      callback(htmlEv);
    }

    this.handleMouseButtonRelease(htmlEv, evType, hitBoxComponent);
    this.handleMouseMove(htmlEv, evType, hitBoxComponent);
  };

  private extractPoint(
    ev: HTMLElementEventMap[keyof HTMLElementEventMap],
    out?: Vec2<number>,
  ): Vec2<number> | undefined {
    const point = out ?? { x: 0, y: 0 };
    if ("offsetX" in ev && "offsetY" in ev) {
      point.x = ev.offsetX;
      point.y = ev.offsetY;
    }
    return point;
  }

  /**
   * Query the highest-priority hitbox at a point.
   * Returns undefined if no hitbox matches.
   */
  private getHitboxAt(point: Vec2<number>): HitboxComponent | undefined {
    let winner: HitboxComponent | undefined;
    let highestLayer = -Infinity;

    const entities = this.ecs.findEntitiesByComponent(HitboxComponent);

    for (let i = 0; i < entities.length; i++) {
      const hb = this.ecs.getComponents(entities[i])?.get(HitboxComponent);
      if (hb && this.hitTest(hb, point)) {
        const layer = hb.layer ?? 0;
        if (layer > highestLayer) {
          highestLayer = layer;
          winner = hb;
        }
      }
    }

    return winner;
  }

  private hitTest(
    hitboxComponent: HitboxComponent,
    point: Vec2<number>,
  ): boolean {
    // preliminary: check point is in bbox
    if (hitboxComponent.getBoundingBox) {
      const bbox = hitboxComponent.getBoundingBox();
      if (!bbox || !isPointInAlignedBBox(point, bbox)) {
        return false;
      }
    }

    // custom hit test
    if (hitboxComponent.hitTest) {
      console.log(`hittest`);
      return hitboxComponent.hitTest(point, this.hitBoxOffscreenCtx);
    }

    // color-based (offscreen canvas pixel-perfect)
    if (hitboxComponent.color) {
      console.log(`color`);
      const pixel = getCtxPixelColor(point.x, point.y, this.hitBoxOffscreenCtx);
      return isSameColor(pixel, hitboxComponent.color);
    }

    // bbox passed or no constraints
    return hitboxComponent.getBoundingBox !== undefined;
  }

  private getCanvasHitbox(_evType: HTMLEventType): HitboxComponent | undefined {
    const entity = this.ecs.findEntitiesByComponent(CanvasHitboxTagComponent);
    if (!entity) {
      console.error("cannot find Canvas Hitbox tag componet");
      return;
    }
    // Assumes there'sonly one entity with CanvasHitboxTagComponent
    const hb = this.ecs.getComponents(entity[0])?.get(HitboxComponent);

    if (!hb) {
      return undefined;
    }
    return hb;
  }

  /** Handle mouse button release across different hitboxes.
   * Ensures that if a mousedown occurs on one hitbox and mouseup on another,
   * the original hitbox's mouseup callback is still invoked.
   */
  private handleMouseButtonRelease = (
    htmlEv: HTMLElementEventMap[keyof HTMLElementEventMap],
    evType: HTMLEventType,
    hitboxComponent: HitboxComponent,
  ): void => {
    if (evType === "mousedown" && this.mouseUpCallback === null) {
      this.mouseUpCallback = hitboxComponent.callbacks?.["mouseup"] || null;
      this.mouseDownTargetId = hitboxComponent.id || null;
    }

    if (evType === "mouseup" && this.mouseUpCallback) {
      if (this.mouseDownTargetId !== hitboxComponent.id) {
        this.mouseUpCallback(htmlEv as HTMLElementEventMap["mouseup"]);
        this.mouseUpCallback = null;
      }
      this.mouseDownTargetId = null;
    }
  };

  /** Handle mouse hover, dragging and mouseout across different hitboxes.
   * Ensures that if a mousedown occurs on one hitbox and mouseup on another,
   * the original hitbox's mouseup callback is still invoked.
   */
  private handleMouseMove = (
    htmlEv: HTMLElementEventMap[keyof HTMLElementEventMap],
    evType: HTMLEventType,
    hitboxComponent: HitboxComponent,
  ): void => {
    if (evType !== "mousemove") {
      return;
    }

    // handle the case where the mouse was previously over another hitbox and mousedown is also set (means a drag could be happening)
    if (
      this.mouseDownTargetId &&
      this.mouseDownTargetId !== hitboxComponent.id
    ) {
      const entity = this.ecs.findEntitiesByComponent(MouseDownTagComponent);
      const hitbox = this.ecs.getComponents(entity[0])?.get(HitboxComponent);
      const originalHitbox = hitbox;

      // if dragging, invoke the mousemove callback of the original hitbox
      const mouseMoveCallback = originalHitbox?.callbacks?.["mousemove"];
      if (mouseMoveCallback && originalHitbox.data?.isDragging) {
        mouseMoveCallback(htmlEv as HTMLElementEventMap["mousemove"]);
        return;
      }
    }

    if (evType === "mousemove" && this.mouseOutCallback === null) {
      this.mouseOutCallback = hitboxComponent.callbacks?.["mouseout"] || null;
      this.mouseMoveTargetId = hitboxComponent.id || null;
    }

    if (evType === "mousemove" && this.mouseOutCallback) {
      if (this.mouseMoveTargetId !== hitboxComponent.id) {
        this.mouseOutCallback(htmlEv as HTMLElementEventMap["mouseout"]);
        this.mouseMoveTargetId = null;
        this.mouseOutCallback = null;
      }
    }
  };
}
