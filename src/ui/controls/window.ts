import { DraggableObject } from "../../mixins";

export const HEADER_HEIGHT = 30;

export class UIWindow extends DraggableObject {
  protected ctx: CanvasRenderingContext2D;

  protected backgroundcolor = "rgba(50, 50, 50, 0.8)";
  protected borderColor = "black";
  protected borderWidth = 2;
  protected textColor = "white";
  protected title: string = "UI Window";

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    super();
    this.canvas = canvas;
    this.ctx = ctx;

    // Initialize position and size (these properties come from BaseObject)
    this.x = 100;
    this.y = 100;
    this.width = 300;
    this.height = 200;
  }

  override async init(
    _deltaTime: number,
    id: string,
    ..._args: []
  ): Promise<any> {
    this.registerDragging(id);
  }
  override update(_deltaTime: number): any {}
  override render() {
    if (
      this.canvas === null ||
      this.x === null ||
      this.y === null ||
      this.width === null ||
      this.height === null
    ) {
      return;
    }
    this.ctx.fillStyle = this.backgroundcolor;
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
    this.ctx.strokeStyle = this.borderColor;
    this.ctx.lineWidth = this.borderWidth;
    this.ctx.strokeRect(this.x, this.y, this.width, this.height);

    this.renderWindowHeader(
      this.ctx,
      { x: this.x, y: this.y },
      this.width,
      HEADER_HEIGHT,
      this.title,
      true
    );
  }
  override clean() {
    this.deregister();
  }

  private renderWindowHeader(
    ctx: CanvasRenderingContext2D,
    position: { x: number; y: number },
    width: number,
    height: number,
    title: string,
    showCloseButton: boolean = true
  ) {
    // Draw header background
    ctx.fillStyle = "#333";
    ctx.fillRect(position.x, position.y, width, height);

    // Draw header border
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect(position.x, position.y, width, height);

    // Draw title text
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText(title, position.x + 10, position.y + 20);

    // Draw close button if needed
    if (showCloseButton) {
      const buttonSize = 16;
      ctx.fillStyle = "#ff5555";
      ctx.fillRect(
        position.x + width - buttonSize - 10,
        position.y + 7,
        buttonSize,
        buttonSize
      );
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        position.x + width - buttonSize - 10,
        position.y + 7,
        buttonSize,
        buttonSize
      );
      ctx.fillStyle = "white";
      ctx.font = "12px Arial";
      ctx.fillText("X", position.x + width - buttonSize - 6, position.y + 20);
    }
  }
}
