import { DIContainer, InteractionManager } from "../core";
import { createBoundingBox } from "../helpers";
import { BaseObject, BoundingBox } from "../models";

const UIWINDOW_HITBOX_KEY = "uiwindow-dragging-hitbox";

export type WithInitialPosition = {
  initialX: number;
  initialY: number;
};
type DraggableChild = BaseObject & Partial<WithInitialPosition>;

export class DraggableObject extends BaseObject {
  interactionManager = DIContainer.getInstance().resolve<InteractionManager>(
    InteractionManager.INTERACTION_MANAGER_ID
  );

  isDragging = false;
  dragStartX: number = 0;
  dragStartY: number = 0;
  initialX: number = 0;
  initialY: number = 0;
  draggingId: string = UIWINDOW_HITBOX_KEY;

  override elements: DraggableChild[] = [];

  boundingBox: BoundingBox<number> = {
    nw: { x: 0, y: 0 },
    se: { x: 0, y: 0 },
  };

  constructor(...args: any[]) {
    super(...(args as []));
  }

  registerDragging = (id?: string) => {
    if (this.canvas === null) {
      return;
    }
    this.draggingId = id ?? UIWINDOW_HITBOX_KEY;
    this.interactionManager.upsertHitbox(this.draggingId, {
      getBoundingBox: this.getBBox,
      callbacks: {
        mousemove: this._mouseHover,
        mousedown: this._mouseDown,
        mouseup: this._mouseUp,
      },
      color: this.interactionManager.colorHeap.getNext(),
    });
  };

  deregister = () => {
    this.interactionManager.removeHitbox(this.draggingId);
  };

  override getBBox = () => {
    return createBoundingBox(this.x, this.y, this.width, this.height);
  };

  _mouseHover = (ev: MouseEvent): void => {
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
      const initialX = el.initialX ?? el.x;
      const initialY = el.initialY ?? el.y;
      el.x = initialX + deltaX;
      el.y = initialY + deltaY;
    }

    // Update boundingBox in the event Handler
    this.boundingBox = createBoundingBox(
      this.x,
      this.y,
      this.width,
      this.height
    );
    this.interactionManager.upsertHitbox(this.draggingId, {
      getBoundingBox: this.getBBox,
    });
  };

  _mouseDown = (ev: MouseEvent): void => {
    if (
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

    this.elements.forEach((el) => {
      el.initialX = el.x;
      el.initialY = el.y;
    });

    this.interactionManager.upsertHitbox(this.draggingId, {
      data: { isDragging: true },
    });
  };

  _mouseUp = (_ev: MouseEvent): void => {
    this.isDragging = false;
    this.interactionManager.upsertHitbox(this.draggingId, {
      data: { isDragging: false },
    });
  };
}
// }
