import { AnonymousClass, BoundingBox, createBoundingBox } from "hypertoroid";
import { BaseObject } from "../models/base-object";
import { WithEventHandling } from "./with-event-handling";

const UIWINDOW_HITBOX_KEY = "uiwindow-hitbox";

type WithInitialPosition = {
  initialX: number;
  initialY: number;
};

interface WithDragging {
  isDragging: boolean;
  dragStartX: number;
  dragStartY: number;
  initialX: number;
  initialY: number;
  registerDragging(): void;
  deregister(): void;
}

export function withDragging<
  T extends AnonymousClass<WithEventHandling & BaseObject>,
>(obj: T): T & AnonymousClass<WithDragging> {
  return class extends obj implements WithDragging {
    isDragging = false;
    dragStartX: number = 0;
    dragStartY: number = 0;
    initialX: number = 0;
    initialY: number = 0;

    override elements: (BaseObject & WithInitialPosition)[] = [];

    boundingBox: BoundingBox<number> = {
      nw: { x: 0, y: 0 },
      se: { x: 0, y: 0 },
    };

    constructor(...args: any[]) {
      super(args);
    }

    registerDragging = () => {
      if (this.canvas === null) {
        return;
      }
      this.interactionManager.upsertHitbox(UIWINDOW_HITBOX_KEY, {
        boundingBox: this.getBBox,
        callbacks: {
          mousemove: this.mouseHover,
          mousedown: this.mouseDown,
          mouseup: this.mouseUp,
        },
        color: { a: 255, r: 100, g: 100, b: 100 },
      });
    };

    deregister = () => {
      this.interactionManager.removeHitbox(UIWINDOW_HITBOX_KEY);
    };

    override getBBox = () => {
      return createBoundingBox(this.x, this.y, this.width, this.height);
    };

    private mouseHover = (ev: MouseEvent): void => {
      if (!this.isDragging) {
        return;
      }
      // We are finally dragging, update position of element and sub-elements
      const deltaX = ev.offsetX - this.dragStartX;
      const deltaY = ev.offsetY - this.dragStartY;
      this.x = this.initialX + deltaX;
      this.y = this.initialY + deltaY;
      for (let i = 0; i < this.elements.length; i++) {
        const el = this.elements[i];
        el.x = el.initialX + deltaX;
        el.y = el.initialY + deltaY;
      }

      // Update boundingBox in the event Handler
      this.boundingBox = createBoundingBox(
        this.x,
        this.y,
        this.width,
        this.height
      );
      this.interactionManager.upsertHitbox(UIWINDOW_HITBOX_KEY, {
        boundingBox: this.getBBox,
      });
    };

    private mouseDown = (ev: MouseEvent): void => {
      if (
        this.x === null ||
        this.y === null ||
        ev.buttons !== 1 ||
        this.isDragging
      ) {
        return;
      }
      this.isDragging = true;
      this.dragStartX = ev.clientX;
      this.dragStartY = ev.clientY;
      this.initialX = this.x;
      this.initialY = this.y;
      // 

      this.elements.forEach((el) => {
        el.initialX = el.x;
        el.initialY = el.y;
      })
    };

    private mouseUp = (_ev: MouseEvent): void => {
      this.isDragging = false;
    };
  };
}
