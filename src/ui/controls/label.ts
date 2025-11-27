import { GameObject, Vec2, BoundingBox } from "../../models";
import { FillStrokeStyle, getTextBBox } from "../canvas";

export class UILabel extends GameObject<CanvasRenderingContext2D> {
  override id: string | undefined;

  protected text: string;
  private readonly DEFAULT_TEXT_STYLE: CanvasTextDrawingStyles = {
    direction: "inherit",
    font: "10px sans-serif",
    fontKerning: "auto",
    fontStretch: "normal",
    fontVariantCaps: "normal",
    letterSpacing: "normal",
    textAlign: "start",
    textBaseline: "alphabetic",
    textRendering: "auto",
    wordSpacing: "normal",
  };
  protected textStyle: CanvasTextDrawingStyles = this.DEFAULT_TEXT_STYLE;
  protected textFillStyle: FillStrokeStyle | undefined = "#000";
  protected textStrokeStyle: FillStrokeStyle | undefined = "#000";

  constructor(
    ctx: CanvasRenderingContext2D,
    id: string,
    posX?: number,
    posY?: number,
    textStyle?: Partial<CanvasTextDrawingStyles>,
    text?: string
  ) {
    super(ctx);
    this.id = id;
    this.position = { x: posX ?? 0, y: posY ?? 0 };
    if (textStyle !== undefined) {
      this.textStyle = { ...this.textStyle, ...textStyle };
    }
    this.text = text ?? "";
  }

  override async init(...args: any) {
    await super.init(...args);
  }
  override async update(deltaTime: number, ...args: any) {
    super.update(deltaTime, args);
    if (this.text === undefined || this.position === undefined) {
      return;
    }
    this.bbox = getTextBBox(this.ctx, this.text, this.position);
  }
  override render(...args: any) {
    super.render(args);
    if (this.position === undefined || this.text === undefined) {
      return;
    }

    this.applyStyles();

    this.ctx.moveTo(this.position?.x, this.position.y);
    this.ctx.strokeText(this.text, this.position.x, this.position.y);
    this.ctx.fillText(this.text, this.position.x, this.position.y);
  }
  override clean(...args: any) {
    super.clean(args);
  }

  setText(text: string) {
    this.text = text;
  }

  override getSize(): Vec2<number> | undefined {
    if (
      this.textFillStyle === undefined ||
      this.textStrokeStyle === undefined
    ) {
      return;
    }

    this.applyStyles();
    const textMetrics = this.ctx.measureText(this.text);

    if (textMetrics === undefined) {
      return undefined;
    }
    return {
      x: textMetrics.width,
      y:
        textMetrics?.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent,
    };
  }
  getBBox(): BoundingBox<number> {
    return this.bbox;
  }

  setTextFillStyle(style: FillStrokeStyle) {
    this.textFillStyle = style;
  }
  setTextStrokeStyle(style: FillStrokeStyle) {
    this.textStrokeStyle = style;
  }
  setTextStyle(textStyle: CanvasTextDrawingStyles) {
    this.textStyle = textStyle;
  }

  protected applyStyles() {
    //TODO add direction
    this.ctx.font = this.textStyle?.font ?? "20px Verdana";
    //TODO addfontKerning
    //TODO addfontStretch
    //TODO addfontVariantCaps
    //TODO addletterSpacing
    this.ctx.textAlign = this.textStyle?.textAlign ?? "left";
    this.ctx.textBaseline = this.textStyle?.textBaseline ?? "alphabetic";
    //TODO add textRendering
    //TODO add wordSpacing

    if (this.textStrokeStyle !== undefined) {
      this.ctx.strokeStyle = this.textStrokeStyle;
    }
    if (this.textFillStyle !== undefined) {
      this.ctx.fillStyle = this.textFillStyle;
    }
  }
}
