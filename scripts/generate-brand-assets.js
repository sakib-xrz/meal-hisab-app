const fs = require("node:fs");
const path = require("node:path");
const { PNG } = require("pngjs");

const OUT_DIR = path.join(__dirname, "..", "assets", "images");

const COLORS = {
  ink: "#0B3B37",
  teal: "#0F766E",
  tealDark: "#0B4F4A",
  mint: "#C8F7E6",
  cream: "#FAFFF9",
  amber: "#F8B84E",
  transparent: null,
};

function hex(hexValue) {
  const value = hexValue.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
    a: 255,
  };
}

function mix(a, b, t) {
  const ca = hex(a);
  const cb = hex(b);
  return {
    r: Math.round(ca.r + (cb.r - ca.r) * t),
    g: Math.round(ca.g + (cb.g - ca.g) * t),
    b: Math.round(ca.b + (cb.b - ca.b) * t),
    a: 255,
  };
}

function create(width, height, background) {
  const png = new PNG({ width, height, colorType: 6 });
  const bg = background ? hex(background) : { r: 0, g: 0, b: 0, a: 0 };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (width * y + x) << 2;
      png.data[i] = bg.r;
      png.data[i + 1] = bg.g;
      png.data[i + 2] = bg.b;
      png.data[i + 3] = bg.a;
    }
  }

  return png;
}

function put(canvas, x, y, color) {
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
  const i = (canvas.width * y + x) << 2;
  const alpha = color.a / 255;
  const existingAlpha = canvas.data[i + 3] / 255;
  const outAlpha = alpha + existingAlpha * (1 - alpha);

  if (outAlpha === 0) {
    canvas.data[i] = 0;
    canvas.data[i + 1] = 0;
    canvas.data[i + 2] = 0;
    canvas.data[i + 3] = 0;
    return;
  }

  canvas.data[i] = Math.round((color.r * alpha + canvas.data[i] * existingAlpha * (1 - alpha)) / outAlpha);
  canvas.data[i + 1] = Math.round((color.g * alpha + canvas.data[i + 1] * existingAlpha * (1 - alpha)) / outAlpha);
  canvas.data[i + 2] = Math.round((color.b * alpha + canvas.data[i + 2] * existingAlpha * (1 - alpha)) / outAlpha);
  canvas.data[i + 3] = Math.round(outAlpha * 255);
}

function clearPixel(canvas, x, y) {
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
  const i = (canvas.width * y + x) << 2;
  canvas.data[i] = 0;
  canvas.data[i + 1] = 0;
  canvas.data[i + 2] = 0;
  canvas.data[i + 3] = 0;
}

function rect(canvas, x, y, width, height, color) {
  const c = typeof color === "string" ? hex(color) : color;
  for (let py = Math.floor(y); py < Math.ceil(y + height); py += 1) {
    for (let px = Math.floor(x); px < Math.ceil(x + width); px += 1) {
      put(canvas, px, py, c);
    }
  }
}

function roundedRect(canvas, x, y, width, height, radius, color) {
  const c = typeof color === "string" ? hex(color) : color;
  const r = Math.min(radius, width / 2, height / 2);
  for (let py = Math.floor(y); py < Math.ceil(y + height); py += 1) {
    for (let px = Math.floor(x); px < Math.ceil(x + width); px += 1) {
      const dx = px < x + r ? x + r - px : px > x + width - r ? px - (x + width - r) : 0;
      const dy = py < y + r ? y + r - py : py > y + height - r ? py - (y + height - r) : 0;
      if (dx * dx + dy * dy <= r * r) put(canvas, px, py, c);
    }
  }
}

function ellipse(canvas, cx, cy, rx, ry, color, clear = false) {
  const c = typeof color === "string" ? hex(color) : color;
  for (let py = Math.floor(cy - ry); py <= Math.ceil(cy + ry); py += 1) {
    for (let px = Math.floor(cx - rx); px <= Math.ceil(cx + rx); px += 1) {
      const nx = (px - cx) / rx;
      const ny = (py - cy) / ry;
      if (nx * nx + ny * ny <= 1) {
        if (clear) clearPixel(canvas, px, py);
        else put(canvas, px, py, c);
      }
    }
  }
}

function ellipseClipped(canvas, cx, cy, rx, ry, color, minY, maxY) {
  const c = typeof color === "string" ? hex(color) : color;
  for (let py = Math.floor(cy - ry); py <= Math.ceil(cy + ry); py += 1) {
    if (py < minY || py > maxY) continue;
    for (let px = Math.floor(cx - rx); px <= Math.ceil(cx + rx); px += 1) {
      const nx = (px - cx) / rx;
      const ny = (py - cy) / ry;
      if (nx * nx + ny * ny <= 1) {
        put(canvas, px, py, c);
      }
    }
  }
}

function line(canvas, x1, y1, x2, y2, width, color, clear = false) {
  const c = typeof color === "string" ? hex(color) : color;
  const minX = Math.floor(Math.min(x1, x2) - width);
  const maxX = Math.ceil(Math.max(x1, x2) + width);
  const minY = Math.floor(Math.min(y1, y2) - width);
  const maxY = Math.ceil(Math.max(y1, y2) + width);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  const radius = width / 2;

  for (let py = minY; py <= maxY; py += 1) {
    for (let px = minX; px <= maxX; px += 1) {
      const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq));
      const cx = x1 + t * dx;
      const cy = y1 + t * dy;
      const distX = px - cx;
      const distY = py - cy;
      if (distX * distX + distY * distY <= radius * radius) {
        if (clear) clearPixel(canvas, px, py);
        else put(canvas, px, py, c);
      }
    }
  }
}

function drawGradient(canvas, top, bottom) {
  for (let y = 0; y < canvas.height; y += 1) {
    const t = y / Math.max(1, canvas.height - 1);
    const c = mix(top, bottom, t);
    rect(canvas, 0, y, canvas.width, 1, c);
  }
}

function drawMark(canvas, cx, cy, size, options = {}) {
  const color = options.color ?? COLORS.cream;
  const accent = options.accent ?? COLORS.amber;
  const cutout = options.cutout ?? true;
  const bowlY = cy - size * 0.02;

  ellipseClipped(
    canvas,
    cx,
    bowlY + size * 0.06,
    size * 0.39,
    size * 0.28,
    color,
    bowlY - size * 0.02,
    bowlY + size * 0.36,
  );
  ellipse(canvas, cx, bowlY - size * 0.08, size * 0.43, size * 0.14, color);
  if (cutout) {
    ellipse(canvas, cx, bowlY - size * 0.08, size * 0.34, size * 0.08, COLORS.transparent, true);
  } else {
    ellipse(canvas, cx, bowlY - size * 0.08, size * 0.34, size * 0.08, { ...hex(COLORS.tealDark), a: 150 });
  }
  roundedRect(canvas, cx - size * 0.16, bowlY + size * 0.33, size * 0.32, size * 0.05, size * 0.03, color);

  const lineColor = cutout ? COLORS.transparent : accent;
  line(canvas, cx - size * 0.17, bowlY - size * 0.02, cx - size * 0.17, bowlY + size * 0.17, size * 0.035, lineColor, cutout);
  line(canvas, cx - size * 0.055, bowlY - size * 0.04, cx - size * 0.055, bowlY + size * 0.19, size * 0.035, lineColor, cutout);
  line(canvas, cx + size * 0.07, bowlY - size * 0.035, cx + size * 0.07, bowlY + size * 0.18, size * 0.035, lineColor, cutout);
  line(canvas, cx + size * 0.19, bowlY - size * 0.02, cx + size * 0.19, bowlY + size * 0.15, size * 0.035, lineColor, cutout);
  line(canvas, cx - size * 0.24, bowlY + size * 0.07, cx + size * 0.26, bowlY + size * 0.18, size * 0.032, lineColor, cutout);

  if (!cutout) {
    ellipse(canvas, cx + size * 0.31, bowlY - size * 0.2, size * 0.04, size * 0.04, accent);
    ellipse(canvas, cx - size * 0.29, bowlY + size * 0.29, size * 0.025, size * 0.025, accent);
  }
}

function downsample(source, width, height, scale) {
  const out = create(width, height, COLORS.transparent);
  const area = scale * scale;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < scale; sy += 1) {
        for (let sx = 0; sx < scale; sx += 1) {
          const i = (source.width * (y * scale + sy) + x * scale + sx) << 2;
          r += source.data[i];
          g += source.data[i + 1];
          b += source.data[i + 2];
          a += source.data[i + 3];
        }
      }
      const o = (width * y + x) << 2;
      out.data[o] = Math.round(r / area);
      out.data[o + 1] = Math.round(g / area);
      out.data[o + 2] = Math.round(b / area);
      out.data[o + 3] = Math.round(a / area);
    }
  }

  return out;
}

function render(width, height, draw, background = COLORS.transparent, scale = 3) {
  const canvas = create(width * scale, height * scale, background);
  draw(canvas, scale);
  return downsample(canvas, width, height, scale);
}

function save(name, png) {
  fs.writeFileSync(path.join(OUT_DIR, name), PNG.sync.write(png));
}

function icon(size) {
  return render(size, size, (canvas, scale) => {
    drawGradient(canvas, COLORS.ink, COLORS.teal);
    ellipse(canvas, size * scale * 0.18, size * scale * 0.12, size * scale * 0.34, size * scale * 0.22, { ...hex(COLORS.mint), a: 55 });
    ellipse(canvas, size * scale * 0.86, size * scale * 0.9, size * scale * 0.38, size * scale * 0.28, { ...hex(COLORS.amber), a: 65 });
    roundedRect(canvas, size * scale * 0.18, size * scale * 0.18, size * scale * 0.64, size * scale * 0.64, size * scale * 0.16, { ...hex("#FFFFFF"), a: 26 });
    drawMark(canvas, size * scale * 0.5, size * scale * 0.52, size * scale * 0.66, {
      color: COLORS.cream,
      accent: COLORS.amber,
      cutout: false,
    });
  }, COLORS.ink, 2);
}

function foreground(size) {
  return render(size, size, (canvas, scale) => {
    drawMark(canvas, size * scale * 0.5, size * scale * 0.5, size * scale * 0.66, {
      color: COLORS.cream,
      accent: COLORS.amber,
      cutout: true,
    });
  }, COLORS.transparent, 3);
}

function splash(width, height) {
  return render(width, height, (canvas, scale) => {
    drawMark(canvas, width * scale * 0.5, height * scale * 0.5, Math.min(width, height) * scale * 0.38, {
      color: COLORS.cream,
      accent: COLORS.amber,
      cutout: true,
    });
  }, COLORS.transparent, 2);
}

save("icon.png", icon(1024));
save("favicon.png", icon(512));
save("android-icon-background.png", render(512, 512, (canvas) => {
  drawGradient(canvas, COLORS.ink, COLORS.tealDark);
}, COLORS.ink, 1));
save("android-icon-foreground.png", foreground(1024));
save("android-icon-monochrome.png", foreground(432));
save("splash-icon.png", splash(1536, 1024));

console.log("Generated Meal Hisab brand assets.");
