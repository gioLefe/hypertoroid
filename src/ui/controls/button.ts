import {
  DIContainer,
  ECS,
  EcsEntity,
  HitboxComponent,
  InteractionManager,
} from "../../core";
import { createBoundingBox } from "../../helpers";
import { BaseObject, Color, colorToString } from "../../models";

const UIBUTTON_HITBOX_KEY = "ui-button-hitbox";

const UIBUTTON_BACKGROUND_COLOR: Color = { r: 100, g: 100, b: 100, a: 255 };
const UIBUTTON_HOVER_COLOR: Color = { r: 150, g: 150, b: 150, a: 255 };
const UIBUTTON_ACTIVE_COLOR: Color = { r: 200, g: 200, b: 200, a: 255 };
const UIBUTTON_TEXT_COLOR: Color = { r: 255, g: 255, b: 255, a: 255 };

export class UIButton extends BaseObject {
  protected interactionManager =
    DIContainer.getInstance().resolve<InteractionManager>(
      InteractionManager.INSTANCE_ID,
    );
  protected ctx: CanvasRenderingContext2D;
  backgroundColor: Color = UIBUTTON_BACKGROUND_COLOR;
  hoverColor: Color = UIBUTTON_HOVER_COLOR;
  textColor: Color = UIBUTTON_TEXT_COLOR;
  activeColor: Color = UIBUTTON_ACTIVE_COLOR;

  isHovering = false;
  layer: number = 50;
  hitBoxId: string = UIBUTTON_HITBOX_KEY;
  entity: EcsEntity | undefined;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    private ecs: ECS,
  ) {
    super();
    this.ctx = ctx;
    this.canvas = canvas;
    this.entity = this.ecs.addEntity();
  }

  override async init(layer: number = 50): Promise<void> {
    await super.init();
    if (!this.entity) return;

    this.layer = layer;
    this.ecs.addComponent(
      this.entity,
      new HitboxComponent(
        this.entity,
        layer,
        {
          mousemove: this.mouseMove,
          mouseout: this.mouseOut,
        },
        undefined,
        this.getBBox,
        undefined,
        this.interactionManager.colorHeap.getNext(),
      ),
    );
  }

  override update(_deltaTime: number): void {
    super.update(_deltaTime);
  }

  override clean(..._args: any): void {
    super.clean();
    if (this.entity) this.ecs.removeComponent(this.entity, HitboxComponent);
  }

  override render(): void {
    this.ctx.fillStyle = this.isHovering
      ? colorToString(this.hoverColor)
      : colorToString(this.backgroundColor);
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  override getBBox = () => {
    return createBoundingBox(this.x, this.y, this.width, this.height);
  };

  mouseMove = (ev: MouseEvent): void => {
    if (ev.offsetX === undefined || ev.offsetY === undefined) {
      return;
    }
    this.isHovering = true;
  };

  mouseOut = (_ev: MouseEvent): void => {
    this.isHovering = false;
  };
}
