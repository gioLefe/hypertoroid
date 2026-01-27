import {
  DIContainer,
  ECS,
  EcsEntity,
  HitboxComponent,
  InteractionManager,
} from "../core";
import { createBoundingBox } from "../helpers";
import { BaseObject } from "../models";

export type WithInitialPosition = {
  initialX: number;
  initialY: number;
};
type DraggableChild = BaseObject & Partial<WithInitialPosition>;

export class DraggableObject extends BaseObject {
  interactionManager = DIContainer.getInstance().resolve<InteractionManager>(
    InteractionManager.INSTANCE_ID,
  );

  isDragging = false;
  dragStartX: number = 0;
  dragStartY: number = 0;
  initialX: number = 0;
  initialY: number = 0;
  entity: EcsEntity | null = null;

  override elements: DraggableChild[] = [];
  private _hb: HitboxComponent | undefined;

  constructor(
    public ecs: ECS,
    ...args: any[]
  ) {
    super(...(args as []));
  }

  registerDragging = () => {
    if (this.canvas === null) {
      return;
    }
    this.entity = this.ecs.addEntity();

    //
    this.ecs.addComponent(
      this.entity,
      new HitboxComponent(
        this.entity,
        100,
        {
          mousemove: this._mouseHover,
          mousedown: this._mouseDown,
          mouseup: this._mouseUp,
        },
        undefined,
        this.getBBox,
        undefined,
        this.interactionManager.colorHeap.getNext(),
        undefined,
      ),
    );
  };

  deregister = () => {
    if (this.entity) this.ecs.removeComponent(this.entity, HitboxComponent);
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
  };

  _mouseDown = (ev: MouseEvent): void => {
    if (ev.buttons !== 1 || this.isDragging || !this.entity) {
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

    this._hb = this.ecs.getComponents(this.entity)?.get(HitboxComponent);
    if (!this._hb) return;
    this._hb.data = { ...this._hb.data, isDragging: true };
  };

  _mouseUp = (_ev: MouseEvent): void => {
    this.isDragging = false;
    if (!this.entity) return;
    this._hb = this.ecs.getComponents(this.entity)?.get(HitboxComponent);
    if (!this._hb) return;
    this._hb.data = { ...this._hb.data, isDragging: false };
  };
}
// }
