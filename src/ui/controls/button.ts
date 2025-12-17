import { createBoundingBox } from "../../helpers";
import { withEventHandling } from "../../mixins";
import { BaseObject, Color, colorToString, GameCycle } from "../../models";

const UIBUTTON_HITBOX_KEY = "ui-button-hitbox";

const UIBUTTON_BACKGROUND_COLOR: Color = { r: 100, g: 100, b: 100, a: 255 };
const UIBUTTON_HOVER_COLOR: Color = { r: 150, g: 150, b: 150, a: 255 };
const UIBUTTON_ACTIVE_COLOR: Color = { r: 200, g: 200, b: 200, a: 255 };
const UIBUTTON_TEXT_COLOR: Color = { r: 255, g: 255, b: 255, a: 255 };

class ButtonBaseClass extends BaseObject {}
class ButtonBase extends withEventHandling(ButtonBaseClass) {}

export class UIButton extends ButtonBase implements GameCycle {
  protected ctx: CanvasRenderingContext2D;
  backgroundColor: Color = UIBUTTON_BACKGROUND_COLOR;
  hoverColor: Color = UIBUTTON_HOVER_COLOR;
  textColor: Color = UIBUTTON_TEXT_COLOR;
  activeColor: Color = UIBUTTON_ACTIVE_COLOR;

  isHovering = false;
  layer: number = 50;
  hitBoxKey: string = UIBUTTON_HITBOX_KEY;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    super();
    this.ctx = ctx;
    this.canvas = canvas;
  }

  override async init(hitBoxId?: string, layer: number = 50): Promise<void> {
    await super.init();
    this.layer = layer;
    this.hitBoxKey = hitBoxId ?? UIBUTTON_HITBOX_KEY;
    this.interactionManager.upsertHitbox(this.hitBoxKey, {
      callbacks: {
        mousemove: this.mouseMove,
        mouseout: this.mouseOut,
      },
      color: { a: 255, r: 2, g: 12, b: 21 },
      layer,
      boundingBox: this.getBBox,
    });
  }

  override async update(_deltaTime: number): Promise<void> {
    await super.update(_deltaTime);
    this.interactionManager.upsertHitbox(UIBUTTON_HITBOX_KEY, {
      layer: this.layer,
      boundingBox: this.getBBox,
    });
  }

  override clean(..._args: any): void {
    super.clean();
    this.interactionManager.removeHitbox(UIBUTTON_HITBOX_KEY);
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
