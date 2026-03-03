import { ColorHeap } from "../helpers";
import {
  CanvasHitboxTagComponent,
  ComponentContainer,
  ECS,
  EcsEntity,
  HitboxComponent,
  KeyboardFocusTagComponent,
} from "./ecs";
import { HTMLEventType } from "./types";

export class InteractionManager {
  static INSTANCE_ID = "InteractionManager";

  colorHeap = new ColorHeap();
  hitBoxCanvas: OffscreenCanvas;
  hitBoxOffscreenCtx: OffscreenCanvasRenderingContext2D;

  private canvas: HTMLCanvasElement;
  private colorizedCache = new Map<string, OffscreenCanvas>();

  // private mouseMoveTargetId: EcsEntity | null = null;
  // private mouseOutCallback: Callback<"mouseout"> | null = null;
  // private mouseDownTargetId: EcsEntity | null = null;
  // private mouseUpCallback: Callback<"mouseup"> | null = null;

  // Cached vars
  private _entities: number[] = [];
  private _components: ComponentContainer | undefined;

  constructor(
    canvas: HTMLCanvasElement,
    private ecs: ECS,
  ) {
    this.canvas = canvas;
    this.hitBoxCanvas = new OffscreenCanvas(
      this.canvas.width,
      this.canvas.height,
    );
    this.hitBoxOffscreenCtx = this.hitBoxCanvas?.getContext("2d", {
      willReadFrequently: true,
    })!;
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
    if (!this.hitBoxCanvas) return;
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
      this._entities = this.ecs.findEntitiesByComponent(
        KeyboardFocusTagComponent,
      );
      if (this._entities.length) {
        this._components = this.ecs.getComponents(this._entities[0]);

        const focusedHitbox = this._components?.get(HitboxComponent);
        const callback = focusedHitbox?.callbacks?.[evType];
        if (callback) {
          console.log(`callback ${evType}`, focusedHitbox.id);
          callback(htmlEv);
        }
        return; // Don't bubble to other listeners
      }

      const canvasHitBox = this.getCanvasHitbox(evType);
      if (canvasHitBox) {
        canvasHitBox.callbacks?.[evType]?.(htmlEv);
      }
    }
  };

  private getCanvasHitbox(_evType: HTMLEventType): HitboxComponent | undefined {
    const entity = this.ecs.findEntitiesByComponent(CanvasHitboxTagComponent);
    if (!entity) {
      console.error("cannot find Canvas Hitbox tag componet");
      return;
    }
    // Assumes there'sonly one entity with CanvasHitboxTagComponent
    return this.ecs.getComponents(entity[0])?.get(HitboxComponent);
  }

  /** Handle mouse button release across different hitboxes.
   * Ensures that if a mousedown occurs on one hitbox and mouseup on another,
   * the original hitbox's mouseup callback is still invoked.
   */
  // private handleMouseButtonRelease = (
  //   htmlEv: HTMLElementEventMap[keyof HTMLElementEventMap],
  //   evType: HTMLEventType,
  //   hitboxComponent: HitboxComponent,
  // ): void => {
  //   if (evType === "mousedown" && this.mouseUpCallback === null) {
  //     this.mouseUpCallback = hitboxComponent.callbacks?.["mouseup"] || null;
  //     this.mouseDownTargetId = hitboxComponent.id || null;
  //   }

  //   if (evType === "mouseup" && this.mouseUpCallback) {
  //     if (this.mouseDownTargetId !== hitboxComponent.id) {
  //       this.mouseUpCallback(htmlEv as HTMLElementEventMap["mouseup"]);
  //       this.mouseUpCallback = null;
  //     }
  //     this.mouseDownTargetId = null;
  //   }
  // };

  /** Handle mouse hover, dragging and mouseout across different hitboxes.
   * Ensures that if a mousedown occurs on one hitbox and mouseup on another,
   * the original hitbox's mouseup callback is still invoked.
   */
  // private handleMouseMove = (
  //   htmlEv: HTMLElementEventMap[keyof HTMLElementEventMap],
  //   evType: HTMLEventType,
  //   hitboxComponent: HitboxComponent,
  // ): void => {
  //   if (evType !== "mousemove") {
  //     return;
  //   }

  //   // handle the case where the mouse was previously over another hitbox and mousedown is also set (means a drag could be happening)
  //   if (
  //     this.mouseDownTargetId &&
  //     this.mouseDownTargetId !== hitboxComponent.id
  //   ) {
  //     const entity = this.ecs.findEntitiesByComponent(MouseDownTagComponent);
  //     const hitbox = this.ecs.getComponents(entity[0])?.get(HitboxComponent);
  //     const originalHitbox = hitbox;

  //     // if dragging, invoke the mousemove callback of the original hitbox
  //     const mouseMoveCallback = originalHitbox?.callbacks?.["mousemove"];
  //     if (mouseMoveCallback && originalHitbox.data?.isDragging) {
  //       mouseMoveCallback(htmlEv as HTMLElementEventMap["mousemove"]);
  //       return;
  //     }
  //   }

  //   if (evType === "mousemove" && this.mouseOutCallback === null) {
  //     this.mouseOutCallback = hitboxComponent.callbacks?.["mouseout"] || null;
  //     this.mouseMoveTargetId = hitboxComponent.id || null;
  //   }

  //   if (evType === "mousemove" && this.mouseOutCallback) {
  //     if (this.mouseMoveTargetId !== hitboxComponent.id) {
  //       this.mouseOutCallback(htmlEv as HTMLElementEventMap["mouseout"]);
  //       this.mouseMoveTargetId = null;
  //       this.mouseOutCallback = null;
  //     }
  //   }
  // };
}
