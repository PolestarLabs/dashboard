/**
 * utils/Picto.ts
 *
 * 1-to-1 Bun / TypeScript reimplementation of
 * PolestarLabs/polaris · core/utilities/Picto-skia.js
 *
 * Same export shape and method signatures as the original so it can be
 * used as a drop-in replacement wherever the legacy module is required.
 *
 * Runtime: Bun + skia-canvas (native addon, supported via Bun's Node-compat layer).
 * Emoji: @polestar/skia-twemoji (optional – falls back to plain text when absent).
 * Blur:  stackblur-canvas via getImageData/putImageData (works on any canvas impl).
 */

import * as Canvas from "skia-canvas";
import { CanvasRenderingContext2D } from "skia-canvas";
import * as StackBlur from "stackblur-canvas";


const π = Math.PI;

// ── Error dedup ───────────────────────────────────────────────────────────────
const KnownErrors = new Map<string, 1>();

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Strip combining diacritical marks that break font-metric measurements.
 * (Mirrors the original `unshitify` helper verbatim.)
 */
function unshitify(text: unknown): string {
  return text?.toString()?.replace(/[\u032A-\u034A\u20D0-\u20FF]/g, "") ?? "";
}

/** Convert a hex colour `"#rrggbb"` to `"r,g,b"` for rgba() strings. */
function RGBstring(hex: string): string {
  const clean = hex.replace("#", "").padStart(6, "0");
  return `${parseInt(clean.slice(0, 2), 16)},${parseInt(clean.slice(2, 4), 16)},${parseInt(clean.slice(4, 6), 16)}`;
}

/** Default font fallback stack — mirrors the original. */
const FF = `"Quicksand","DX아기사랑B","Corporate Logo Rounded",sans-serif`;

function fontStr(font: string): string {
  return `${font},${FF}`.trim();
}

/** The blur method attached to every context produced by `Picto.new()`. */
function blurMethod(this: CanvasRenderingContext2D, rad = 10, x = 0, y = 0, w?: number, h?: number) {
  const W = w ?? this.canvas.width;
  const H = h ?? this.canvas.height;
  const id = this.getImageData(x, y, W, H);
  StackBlur.imageDataRGB(id as any, 0, 0, W, H, rad);
  this.putImageData(id, x, y);
}

// ── Public types ──────────────────────────────────────────────────────────────

export interface TagResult {
  item:   InstanceType<typeof Canvas.Canvas>;
  height: number;
  width:  number;
  /** Alias of `width` for legacy call-sites that use `.w`. */
  w:      number;
}

export interface StrokeOptions {
  style: string;
  line:  number;
}

export interface BlockOptions {
  stroke?: StrokeOptions;
  [k: string]: unknown;
}

export interface RadiusOptions {
  tl?: number;
  tr?: number;
  br?: number;
  bl?: number;
}

// ─────────────────────────────────────────────────────────────────────────────

function makeTag(
  text: unknown,
  font: string,
  color: string,
  stroke: StrokeOptions | undefined,
  ctxRef: CanvasRenderingContext2D,
): TagResult {
  const str = unshitify(text);
  const fs  = fontStr(font);

  // Measure in a scratch canvas
  const scratch = new Canvas.Canvas(100, 100);
  const mc      = scratch.getContext("2d") as any;
  mc.font       = fs;
  (ctxRef as any).font = fs;

  const m  = mc.measureText(str);
  const H  = m.emHeightAscent  ?? m.actualBoundingBoxAscent  ?? 12;
  const hD = m.emHeightDescent ?? m.actualBoundingBoxDescent ?? 4;
  const h  = hD + (stroke?.line ?? 0);
  let   w  = mc.measureText(str).width + (stroke?.line ?? 0);
  if (font.toLowerCase().includes("italic")) w += (w / (str.length || 1)) * 0.32;

  const W = Math.max(1, Math.ceil(w));
  // Legacy implementation simply used h + H (no extra padding).  Previous
  // attempt at 10% padding caused vertical positioning drift compared to
  // the original renders, which is why the 45% text looked off.  Keep the
  // same formula as tagMoji and the original JS version.
  const totalH = Math.max(1, Math.ceil(h + H));

  const item = new Canvas.Canvas(W, totalH);
  const c    = item.getContext("2d") as any;
  c.font     = fs;

  if (stroke) {
    c.strokeStyle = stroke.style;
    c.lineWidth   = stroke.line;
    c.strokeText(str, 1 + stroke.line / 2, H + stroke.line / 2);
  }
  c.fillStyle = color;
  c.fillText(str, 1 + (stroke ? stroke.line / 2 : 0), H + (stroke ? stroke.line / 2 : 0));

  return { item, height: totalH, width: W, w: W };
}

// ─────────────────────────────────────────────────────────────────────────────

const Picto = {

  // ── Canvas factory ──────────────────────────────────────────────────────────

  new(w = 800, h = 600): InstanceType<typeof Canvas.Canvas> {
    const canvas = new Canvas.Canvas(w, h);
    const c      = canvas.getContext("2d") as any;
    c.antialias  = "subpixel";
    c.filter     = "best";
    c.blur       = blurMethod.bind(c);
    return canvas;
  },

  // ── Image loading ───────────────────────────────────────────────────────────

  /**
   * Loads an image from a URL or file path and resolves it as a Canvas.
   * Falls back to `fallback_url`, then to a 250×250 magenta error canvas.
   */
  getCanvas(
    img_path: string,
    fallback_url = "",
  ): Promise<InstanceType<typeof Canvas.Canvas>> {
    return Canvas.loadImage(img_path)
      .catch(() => Canvas.loadImage(fallback_url).catch(() => null))
      .then((img) => {
        if (!img) {
          const err = `• ${img_path.replace("undefined", "?")} not loaded.`;
          if (!KnownErrors.has(err)) {
            console.error(err);
            KnownErrors.set(err, 1);
          }
          const fb  = new Canvas.Canvas(250, 250);
          const fc  = fb.getContext("2d") as any;
          fc.fillStyle = "#FF00FF";
          fc.fillRect(0, 0, 250, 250);
          (fb as any).failed = true;
          return fb;
        }
        const canvas = new Canvas.Canvas(img.width, img.height);
        const c      = canvas.getContext("2d") as any;
        c.drawImage(img, 0, 0);
        return canvas;
      });
  },

  /** Same as `getCanvas` but rejects on load failure — no fallback. */
  getFullCanvas(img_path: string): Promise<InstanceType<typeof Canvas.Canvas>> {
    return Canvas.loadImage(img_path).then((img) => {
      const canvas = new Canvas.Canvas(img.width, img.height);
      canvas.getContext("2d").drawImage(img, 0, 0);
      return canvas;
    });
  },

  // ── Text – single-line ──────────────────────────────────────────────────────

  /**
   * Renders `text` onto a tightly-sized off-screen canvas.
   * Returns `{ item, height, width, w }` for use with `setAndDraw` / `popOutTxt`.
   */
  tag(
    ctx:    CanvasRenderingContext2D,
    text:   unknown,
    font    = "14px",
    color   = "#b4b4b8",
    stroke?: StrokeOptions,
  ): TagResult {
    return makeTag(text, font, color, stroke, ctx);
  },

  /**
   * Like `tag` but renders emoji via `@polestar/skia-twemoji`.
   * Falls back silently to `tag` when the private package is absent.
   */
  async tagMoji(
    ctx:    CanvasRenderingContext2D,
    text:   unknown,
    font    = "14px",
    color   = "#b4b4b8",
    stroke?: StrokeOptions,
  ): Promise<TagResult> {
    let fillTextWithTwemoji: ((c: any, t: string, x: number, y: number, opts?: any) => Promise<void>) | null = null;
    try {
        // dynamically import emoji helper if present
      ({ fillTextWithTwemoji } = await import("@polestar/skia-twemoji")).fillTextWithTwemoji; // may throw

    } catch {
      return this.tag(ctx, text, font, color, stroke);
    }

    const str  = unshitify(text);
    const fs   = fontStr(font);
    const scratch  = new Canvas.Canvas(100, 100);
    const mc       = scratch.getContext("2d") as any;
    mc.font        = fs;
    (ctx as any).font = fs;

    const m  = mc.measureText(str);
    const H  = m.emHeightAscent  ?? m.actualBoundingBoxAscent  ?? 12;
    const hD = m.emHeightDescent ?? m.actualBoundingBoxDescent ?? 4;
    const h  = hD + (stroke?.line ?? 0);
    let   w  = mc.measureText(str).width + (stroke?.line ?? 0);
    if (font.toLowerCase().includes("italic")) w += (w / (str.length || 1)) * 0.32;

    const W      = Math.max(1, Math.ceil(w));
    const totalH = Math.max(1, Math.ceil(h + H));
    const item   = new Canvas.Canvas(W, totalH);
    const c      = item.getContext("2d") as any;
    c.font       = fs;

    if (stroke) {
      c.strokeStyle = stroke.style;
      c.lineWidth   = stroke.line;
      c.strokeText(str, 1 + stroke.line / 2, H + stroke.line / 2);
    }
    c.fillStyle = color;
    await fillTextWithTwemoji!(
      c, str,
      1 + (stroke ? stroke.line / 2 : 0),
      H  + (stroke ? stroke.line / 2 : 0) + totalH * 0.1,
      { maxWidth: w },
    );

    return { item, height: totalH, width: W, w: W };
  },

  // ── Text – multi-line block ─────────────────────────────────────────────────

  /**
   * Renders word-wrapped `text` into a fixed `W×H` canvas using skia-canvas's
   * native `textWrap = true` (mirrors the skia-specific `block` implementation).
   */
  block(
    ctx:            CanvasRenderingContext2D,
    text:           unknown,
    font            = "14px",
    color           = "#b4b4b8",
    W               = 300,
    H               = 200,
    options: BlockOptions = {},
  ): TagResult {
    const str = unshitify(text);
    const fs  = fontStr(font);
    (ctx as any).font = fs;

    const item = new Canvas.Canvas(W, H);
    const c    = item.getContext("2d") as any;
    c.antialias = "subpixel";
    c.filter    = "best";
    c.font      = fs;

    const { stroke } = options;
    if (stroke) {
      c.strokeStyle = stroke.style;
      c.lineWidth   = stroke.line;
    }
    c.fillStyle = color;
    c.textWrap  = true;

    const initialH = ~~(1 + c.measureText(str).fontBoundingBoxAscent);
    if (stroke) c.strokeText(str, 0, initialH, W);
    c.fillText(str, 0, initialH, W);

    return { item, height: H, width: W, w: W };
  },

  /**
   * Variant of `block` that uses canvas-text-wrapper when available, falling
   * back to the native `textWrap` path. Mirrors the `block2` implementation.
   */
  async block2(
    ctx:            CanvasRenderingContext2D,
    text:           unknown,
    font            = "14px",
    color           = "#b4b4b8",
    W               = 300,
    H               = 200,
    options: BlockOptions = {},
  ): TagResult {
    const str = unshitify(text);
    const fs  = fontStr(font);
    (ctx as any).font = fs;

    const item = new Canvas.Canvas(W, H);
    const c    = item.getContext("2d") as any;
    c.antialias = "subpixel";
    c.filter    = "best";
    c.font      = fs;

    const { stroke } = options;
    if (stroke) {
      c.strokeStyle = stroke.style;
      c.lineWidth   = stroke.line;
    }
    c.fillStyle = color;

    // Try the external text-wrapper first; fall back to native textWrap
    let wrap: ((canvas: any, text: string, opts: any) => void) | null = null;
    try {
      const mod = await import("canvas-text-wrapper");
      wrap = mod.CanvasTextWrapper;
    } catch { /* not installed */ }

    if (wrap) {
      const wrapOpts = {
        strokeText:    !!stroke,
        font:          fs,
        textAlign:     "left",
        verticalAlign: "top",
        lineBreak:     "auto",
        ...options,
      };
      wrap(item, str, wrapOpts);
    } else {
      c.textWrap = true;
      const initialH = ~~(1 + c.measureText(str).fontBoundingBoxAscent);
      if (stroke) c.strokeText(str, 0, initialH, W);
      c.fillText(str, 0, initialH, W);
    }

    return { item, height: H, width: W, w: W };
  },

  // ── Colour sampling ─────────────────────────────────────────────────────────

  /**
   * Returns the average colour of `link` as a hex string.
   * Defaults to `"#2b2b3b"` on any error.
   *
   * Note: the `r` channel uses `~` (bitwise NOT) — intentional 1:1 match with
   * the original, which has the same quirk.
   */
  async avgColor(link: string, blockSize = 5): Promise<string> {
    let imgEl: any;
    try {
      imgEl = await Canvas.loadImage(link);
    } catch {
      return "#2b2b3b";
    }
    if (!imgEl?.width) return "#2b2b3b";

    const w      = imgEl.width;
    const h      = imgEl.height;
    const canvas = new Canvas.Canvas(w, h);
    const c      = canvas.getContext("2d") as any;
    c.drawImage(imgEl, 0, 0);

    const { data } = c.getImageData(0, 0, w, h);
    const len = data.length;
    const rgb = { r: 0, g: 0, b: 0 };
    let count = 0;
    let i     = blockSize * 4 - 4;

    while (i < len) {
      count++;
      rgb.r += data[i];
      rgb.g += data[i + 1];
      rgb.b += data[i + 2];
      i += blockSize * 4;
    }

    // eslint-disable-next-line no-bitwise
    rgb.r = ~(rgb.r / count);   // original uses ~ (not ~~) for r — kept as-is
    rgb.g = ~~(rgb.g / count);
    rgb.b = ~~(rgb.b / count);

    const hex = (n: number) => (`0${parseInt(String(n), 10).toString(16)}`).slice(-2);
    return `#${hex(rgb.r)}${hex(rgb.g)}${hex(rgb.b)}`;
  },

  // ── Shape primitives ────────────────────────────────────────────────────────

  /**
   * Draws a rounded rectangle path and optionally fills / strokes it.
   * `fill` can be a colour string, an image canvas, or falsy.
   * `radius` can be a single number or `{ tl, tr, br, bl }`.
   */
  roundRect(
    ctx:        CanvasRenderingContext2D,
    x           = 0,
    y           = 0,
    width       = 10,
    height      = 10,
    radius:     number | RadiusOptions = 5,
    fill?:      string | InstanceType<typeof Canvas.Canvas> | null,
    stroke:     boolean | string = false,
    lineWidth   = 3,
  ) {
    const r: Required<RadiusOptions> =
      typeof radius === "number"
        ? { tl: radius, tr: radius, br: radius, bl: radius }
        : { tl: 0, tr: 0, br: 0, bl: 0, ...radius };

    ctx.beginPath();
    ctx.moveTo(x + r.tl, y);
    ctx.lineTo(x + width - r.tr, y);
    ctx.quadraticCurveTo(x + width, y,          x + width,          y + r.tr);
    ctx.lineTo(x + width, y + height - r.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r.br,   y + height);
    ctx.lineTo(x + r.bl, y + height);
    ctx.quadraticCurveTo(x,         y + height, x,                  y + height - r.bl);
    ctx.lineTo(x, y + r.tl);
    ctx.quadraticCurveTo(x, y,      x + r.tl,   y);

    if (fill && typeof fill === "object") {
      // Image fill — clip to shape then draw image inside
      ctx.save();
      ctx.clip();
      ctx.drawImage(fill as any, x, y, width, height);
      ctx.closePath();
      ctx.restore();
    } else {
      ctx.closePath();
    }

    if (typeof fill === "string") {
      ctx.fillStyle = fill;
      ctx.fill();
    }

    if (stroke) {
      ctx.strokeStyle = typeof stroke === "string" ? stroke : ctx.strokeStyle;
      ctx.lineWidth   = lineWidth;
      ctx.stroke();
    }
  },

  // ── Drawing utility ─────────────────────────────────────────────────────────

  /**
   * Draws a `TagResult` (from `tag` / `block`) onto `ct` at `(x, y)` with
   * width capped to `maxW`, aligned left / center / right.
   */
  setAndDraw(
    ct:     CanvasRenderingContext2D,
    img:    TagResult,
    x:      number,
    y:      number,
    maxW    = 300,
    align:  "left" | "center" | "right" = "left",
  ) {
    let w = img.w ?? img.width;
    if (w > maxW) w = maxW;

    if (align === "left")   ct.drawImage(img.item as any, x,        y, w, img.height);
    if (align === "center") ct.drawImage(img.item as any, x - w / 2, y, w, img.height);
    if (align === "right")  ct.drawImage(img.item as any, x - w,    y, w, img.height);
  },

  // ── Pop-out text ─────────────────────────────────────────────────────────────

  /**
   * Draws `TXT` twice — once as a thick stroke shadow, once as the fill colour
   * offset by `shadow` px — producing the "pop out" 3-D text effect.
   *
   * Returns `{ w, h }` (pixel size of the drawn text) so callers can chain
   * additional drawing around it.
   */
  popOutTxt(
    ctx:        CanvasRenderingContext2D,
    TXT:        unknown,
    X           = 0,
    Y           = 0,
    font?:      string,
    color       = "#ffffff",
    maxWidth:   number | null = 0,
    stroke: StrokeOptions = { style: "#1b1b2b", line: 10 },
    shadow      = 0,
  ): { w: number; h: number } {
    TXT            = unshitify(TXT);
    shadow         = shadow || stroke.line / 2 - 1;
    stroke.style ??= "#1b1b2b";
    stroke.line  ??= 10;
    const FONT = (font || (ctx as any).font || "20pt 'Corporate Logo Rounded'").trim();
    const mW   = maxWidth ?? 0;

    // Layer 1 — stroke (shadow)
    let tag = this.tag(ctx, TXT, FONT, stroke.style, stroke);
    ctx.drawImage(
      tag.item as any, X, Y,
      mW && tag.width > mW ? mW : tag.width,
      tag.height,
    );

    // Layer 2 — fill (offset by shadow px)
    tag = this.tag(ctx, TXT, FONT, color, stroke);
    ctx.drawImage(
      tag.item as any,
      X - shadow,
      Y - shadow,
      mW && tag.width > mW ? mW : tag.width,
      tag.height,
    );

    // Legacy implementation added stroke+shadow padding to the returned width
    // (see bot/core/utilities/Picto-skia.js).  Call-sites subtract ~30px
    // themselves, so returning the full padded width restores the original
    // coordinate math.
    const paddedW = mW && tag.width > mW
      ? mW
      : tag.width + stroke.line + shadow + 2;

    return { w: paddedW, h: tag.height };
  },

  // ── Circular progress chart ──────────────────────────────────────────────────

  /**
   * Renders a circular XP / progress badge.
   *
   * @param size   Diameter in pixels.
   * @param pcent  Progress 0–1; pass `"1"` for a full ring.
   * @param color  Hex colour for the arc fill.
   * @param pic    Optional image URL rendered inside the circle.
   * @param lvthis Number shown in the centre.
   * @param term   Label below the number (default `"level"`).
   * @param font   Override font for the level number.
   */
  async XChart(
    size:     number,
    pcent:    number | "1",
    color     = "#2b2b3b",
    pic?:     string,
    lvthis?:  number,
    term      = "level",
    font?:    string,
  ): Promise<InstanceType<typeof Canvas.Canvas>> {
    const canvas = new Canvas.Canvas(size, size);
    const ctx    = canvas.getContext("2d") as any;
    const rx     = size / 2;

    function pToR(p: number | "1") {
      const r = ((Number(p) * 2) % 2) + 1.5;
      if (r >= 0 && r <= 2) return r;
      return Math.abs((2 - r) % 2);
    }

    const startR = (π * 3) / 2;
    let   endR   = pToR(pcent) * π;
    if (pcent === "1") endR = (π * 7) / 2;

    function arcDraw(r: number, clr: string) {
      ctx.beginPath();
      ctx.arc(rx, rx, r, startR, endR, false);
      ctx.fillStyle = clr;
      ctx.lineTo(rx, rx);
      ctx.closePath();
      ctx.fill();
    }

    const RGBs = RGBstring(color);

    // Outer decorative ring
    ctx.beginPath();
    ctx.arc(rx, rx, rx - 5, 0, π * 2, true);
    ctx.strokeStyle = `rgba(${RGBs},0.25)`;
    ctx.lineWidth   = 4;
    ctx.stroke();
    arcDraw(rx, color);

    // Inner white fill
    ctx.beginPath();
    ctx.arc(rx, rx, rx - 7, 0, π * 2, false);
    ctx.fillStyle = "#FFF";
    ctx.lineTo(rx, rx);
    ctx.closePath();
    ctx.fill();

    if (pic) {
      ctx.save();
      ctx.clip();
      const a = await Canvas.loadImage(pic);
      ctx.drawImage(a, 0, 0, size, size);
      ctx.restore();
    }

    // Semi-transparent glass layer
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.fill();

    // Percentage text
    ctx.font = (font ?? "900 18px Panton").trim();
    const t  = `${(Number(pcent) * 100).toFixed(0)}%`;
    const WW = ctx.measureText(`${t}%`).width;
    ctx.fillText(t, size / 2 + 15 - WW / 2, size - 15);

    // Build and draw label + level number
    const label   = this.tag(ctx, term.toUpperCase(), undefined, "#222");
    const lvDisp  = (lvthis ?? 0) > 999
      ? String(lvthis).replace(/\B(?=(\d{3})+(?!\d))/g, " ")
      : String(lvthis ?? "");
    const tg = this.tag(ctx, lvDisp, "900 56px 'Panton Black'", "#363636");

    const f   = 0.8;
    const lx  = size / 2 - label.width  / 2 / f;
    const lh  = label.height / f;
    const lw  = label.width  / f;
    let   tW  = tg.width;
    if (tW > size) tW = size - 12;
    const x   = size / 2 - tW / 2;
    const yTg = size / 2 - tg.height / 2 + 7;

    ctx.drawImage(label.item, lx, 15,  lw, lh);
    ctx.drawImage(tg.item,    x,  yTg, tW, tg.height);

    return canvas;
  },

  // ── Hexagon avatar ───────────────────────────────────────────────────────────

  /**
   * Clips `picture` (optional) into a regular hexagon of outer diameter `size`.
   * When no picture is supplied, returns a plain filled hexagon.
   */
  async makeHex(
    size:     number,
    picture?: string,
    color     = "#FFF",
  ): Promise<InstanceType<typeof Canvas.Canvas>> {
    const half = size / 2;
    const x    = half + 10;
    const y    = -half;

    const hex = new Canvas.Canvas(half * 2 + 20, half * 2 + 20);
    const c   = hex.getContext("2d") as any;

    c.rotate(1.57);
    c.save();
    c.beginPath();
    c.moveTo(x + half * Math.cos(0), y + half * Math.sin(0));

    for (let side = 0; side < 7; side++) {
      c.lineTo(
        x + half * Math.cos((side * 2 * π) / 6),
        y + half * Math.sin((side * 2 * π) / 6),
      );
    }

    c.fillStyle = color;
    c.fill();

    if (picture) {
      c.clip();
      const a = await Canvas.loadImage(picture);
      c.rotate(-1.57);
      c.drawImage(a, 0, x - half, half * 2, half * 2);
      c.restore();

      // Hexagonal XOR shadow border
      c.globalCompositeOperation = "xor";
      c.shadowOffsetX = 0;
      c.shadowOffsetY = 0;
      c.shadowBlur    = 10;
      c.shadowColor   = "rgba(30,30,30,1)";

      c.beginPath();
      for (let side = 0; side < 7; side++) {
        c.lineTo(
          x + half * Math.cos((side * 2 * π) / 6),
          y + half * Math.sin((side * 2 * π) / 6),
        );
      }
      c.stroke(); c.stroke(); c.stroke();
      c.globalCompositeOperation = "destination-atop";
    } else {
      c.shadowColor = "rgba(34,31,59,0.57)";
      c.shadowBlur  = 8;
    }

    c.fill();
    return hex;
  },

  // ── Circle avatar ────────────────────────────────────────────────────────────

  /**
   * Clips `pic` (optional) into a circle of diameter `size`.
   */
  async makeRound(
    size: number,
    pic?: string,
  ): Promise<InstanceType<typeof Canvas.Canvas>> {
    const rx     = size / 2;
    const canvas = new Canvas.Canvas(size, size);
    const ctx    = canvas.getContext("2d") as any;

    ctx.beginPath();
    ctx.arc(rx, rx, rx, 0, π * 2, true);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth   = 4;
    ctx.fillStyle   = "#FFF";
    ctx.lineTo(rx, rx);
    ctx.closePath();
    ctx.fill();

    if (pic) {
      ctx.clip();
      const a = await Canvas.loadImage(pic);
      ctx.drawImage(a, 0, 0, size, size);
      ctx.restore();
    }

    return canvas;
  },

  /** Legacy alias for `makeRound`. */
  get circle() { return this.makeRound.bind(this); },
};

export default Picto;
export { Picto };
