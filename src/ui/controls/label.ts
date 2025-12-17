import { BaseObject, BoundingBox, Size2 } from "../../models";
import { FillStrokeStyle, getTextBBox } from "../canvas";

export class UILabel extends BaseObject {
  id: string | undefined;
  protected ctx: CanvasRenderingContext2D | undefined;
  protected text: string | undefined;
  protected textStyle: Partial<CanvasTextDrawingStyles> | undefined;
  protected textFillStyle: FillStrokeStyle = "#000";
  protected textStrokeStyle: FillStrokeStyle = "#000";

  constructor() {
    super();
  }

  override async init() {}
  override async update() {
    if (this.text === undefined || this.ctx === undefined) {
      return;
    }
    this.calcBBox();
  }
  override render() {
    if (this.text === undefined || this.ctx === undefined) {
      return;
    }

    this.applyStyles();

    this.ctx.moveTo(this.x, this.y);
    this.ctx.strokeText(this.text, this.x, this.y);
    this.ctx.fillText(this.text, this.x, this.y);
  }
  override clean() {}

  setText(text: string) {
    this.text = text;
  }

  override getSize(): Size2 | undefined {
    if (
      this.textFillStyle === undefined ||
      this.textStrokeStyle === undefined ||
      this.text === undefined ||
      this.ctx === undefined
    ) {
      return;
    }

    this.applyStyles();
    const textMetrics = this.ctx.measureText(this.text);

    if (textMetrics === undefined) {
      return undefined;
    }
    return {
      width: textMetrics.width,
      height:
        textMetrics?.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent,
    };
  }
  override getBBox = (): BoundingBox<number> | undefined => {
    if (!this.ctx) {
      return undefined;
    }
    return getTextBBox(this.ctx, this.text ?? "", { x: this.x, y: this.y });
  };
  override calcBBox(): void {
    if (this.text === undefined || this.ctx === undefined) {
      return;
    }
    this.bbox = getTextBBox(this.ctx, this.text, { x: this.x, y: this.y });
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
    if (this.ctx === undefined) {
      return;
    }
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
