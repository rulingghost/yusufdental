import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cubic Bezier evaluation
function bezierPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y
  };
}

const curves = [
  // M 7 2
  // C 4.5 2, 3 4, 3 6.5
  { p0: { x: 7, y: 2 }, p1: { x: 4.5, y: 2 }, p2: { x: 3, y: 4 }, p3: { x: 3, y: 6.5 } },
  // C 3 9, 4.2 12.5, 5 15.5
  { p0: { x: 3, y: 6.5 }, p1: { x: 3, y: 9 }, p2: { x: 4.2, y: 12.5 }, p3: { x: 5, y: 15.5 } },
  // C 5.8 18.5, 6.5 22, 8 22
  { p0: { x: 5, y: 15.5 }, p1: { x: 5.8, y: 18.5 }, p2: { x: 6.5, y: 22 }, p3: { x: 8, y: 22 } },
  // C 9.5 22, 10 19, 11 15
  { p0: { x: 8, y: 22 }, p1: { x: 9.5, y: 22 }, p2: { x: 10, y: 19 }, p3: { x: 11, y: 15 } },
  // C 11.5 13, 12.5 13, 13 15
  { p0: { x: 11, y: 15 }, p1: { x: 11.5, y: 13 }, p2: { x: 12.5, y: 13 }, p3: { x: 13, y: 15 } },
  // C 14 19, 14.5 22, 16 22
  { p0: { x: 13, y: 15 }, p1: { x: 14, y: 19 }, p2: { x: 14.5, y: 22 }, p3: { x: 16, y: 22 } },
  // C 17.5 22, 18.2 18.5, 19 15.5
  { p0: { x: 16, y: 22 }, p1: { x: 17.5, y: 22 }, p2: { x: 18.2, y: 18.5 }, p3: { x: 19, y: 15.5 } },
  // C 19.8 12.5, 21 9, 21 6.5
  { p0: { x: 19, y: 15.5 }, p1: { x: 19.8, y: 12.5 }, p2: { x: 21, y: 9 }, p3: { x: 21, y: 6.5 } },
  // C 21 4, 19.5 2, 17 2
  { p0: { x: 21, y: 6.5 }, p1: { x: 21, y: 4 }, p2: { x: 19.5, y: 2 }, p3: { x: 17, y: 2 } },
  // C 15 2, 13.5 3.5, 12 3.5
  { p0: { x: 17, y: 2 }, p1: { x: 15, y: 2 }, p2: { x: 13.5, y: 3.5 }, p3: { x: 12, y: 3.5 } },
  // C 10.5 3.5, 9 2, 7 2
  { p0: { x: 12, y: 3.5 }, p1: { x: 10.5, y: 3.5 }, p2: { x: 9, y: 2 }, p3: { x: 7, y: 2 } }
];

// Sample polygon
const polygon = [];
const STEPS = 20;
for (const c of curves) {
  for (let s = 0; s < STEPS; s++) {
    polygon.push(bezierPoint(c.p0, c.p1, c.p2, c.p3, s / STEPS));
  }
}

function pointInPolygon(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function isInsideStar(px, py) {
  // Center (24.5, 6.5)
  const cx = 24.5;
  const cy = 6.5;
  const dx = Math.abs(px - cx);
  const dy = Math.abs(py - cy);
  // Diamond/star with r=2.5
  return (dx + dy <= 2.2) || (dx <= 0.5 && dy <= 3.2) || (dy <= 0.5 && dx <= 3.2);
}

function isInSquircle(x, y, size, radius) {
  if (x >= radius && x <= size - radius && y >= 0 && y <= size) return 1;
  if (y >= radius && y <= size - radius && x >= 0 && x <= size) return 1;
  
  const corners = [
    { cx: radius, cy: radius },
    { cx: size - radius, cy: radius },
    { cx: radius, cy: size - radius },
    { cx: size - radius, cy: size - radius }
  ];

  for (const c of corners) {
    const dx = x - c.cx;
    const dy = y - c.cy;
    if ((x < c.cx || x > c.cx) && (y < c.cy || y > c.cy)) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= radius) return 1;
      if (dist <= radius + 0.5) return (radius + 0.5 - dist) / 0.5;
    }
  }
  return 0;
}

function renderFavicon(size) {
  const SAMPLES = 4;
  const radius = size * 0.25;
  const toothScale = (size * 0.62) / 24;
  const offsetX = (size - 24 * toothScale) / 2;
  const offsetY = (size - 24 * toothScale) / 2 + size * 0.02;

  const pixels = new Uint8ClampedArray(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let totalR = 0, totalG = 0, totalB = 0, totalA = 0;

      for (let sy = 0; sy < SAMPLES; sy++) {
        for (let sx = 0; sx < SAMPLES; sx++) {
          const px = x + (sx + 0.5) / SAMPLES;
          const py = y + (sy + 0.5) / SAMPLES;

          const sqAlpha = isInSquircle(px, py, size, radius);
          if (sqAlpha <= 0) continue;

          // Background gradient (#06b6d4 -> #0284c7)
          const t = (px + py) / (2 * size);
          let r = Math.round(6 * (1 - t) + 2 * t);
          let g = Math.round(182 * (1 - t) + 132 * t);
          let b = Math.round(212 * (1 - t) + 199 * t);
          let a = sqAlpha;

          // Subtle top gloss
          if (py < size * 0.45) {
            const gloss = (1 - py / (size * 0.45)) * 0.2;
            r = Math.round(r * (1 - gloss) + 255 * gloss);
            g = Math.round(g * (1 - gloss) + 255 * gloss);
            b = Math.round(b * (1 - gloss) + 255 * gloss);
          }

          // Tooth check
          const tx = (px - offsetX) / toothScale;
          const ty = (py - offsetY) / toothScale;

          if (pointInPolygon(tx, ty, polygon) || isInsideStar(px, py)) {
            // Crisp White with highlight
            r = 255;
            g = 255;
            b = 255;
          }

          totalR += r * a;
          totalG += g * a;
          totalB += b * a;
          totalA += a;
        }
      }

      const count = SAMPLES * SAMPLES;
      const finalA = totalA / count;
      const idx = (y * size + x) * 4;

      if (finalA > 0) {
        pixels[idx + 0] = Math.round(totalR / totalA);
        pixels[idx + 1] = Math.round(totalG / totalA);
        pixels[idx + 2] = Math.round(totalB / totalA);
        pixels[idx + 3] = Math.round(finalA * 255);
      } else {
        pixels[idx + 0] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0;
      }
    }
  }

  return pixels;
}

function createIco(size, pixels) {
  const headerSize = 6;
  const dirSize = 16;
  const dibHeaderSize = 40;
  const imageSize = size * size * 4;
  const maskSize = (size * size) / 8;
  const totalResSize = dibHeaderSize + imageSize + maskSize;
  const fileSize = headerSize + dirSize + totalResSize;

  const buf = Buffer.alloc(fileSize);

  // ICONDIR
  buf.writeUInt16LE(0, 0); // reserved
  buf.writeUInt16LE(1, 2); // 1 = icon
  buf.writeUInt16LE(1, 4); // 1 image

  // ICONDIRENTRY
  buf.writeUInt8(size, 6);
  buf.writeUInt8(size, 7);
  buf.writeUInt8(0, 8); // color count
  buf.writeUInt8(0, 9); // reserved
  buf.writeUInt16LE(1, 10); // planes
  buf.writeUInt16LE(32, 12); // bpp
  buf.writeUInt32LE(totalResSize, 14); // dwBytesInRes
  buf.writeUInt32LE(headerSize + dirSize, 18); // dwImageOffset (22)

  // BITMAPINFOHEADER
  let offset = 22;
  buf.writeUInt32LE(dibHeaderSize, offset);
  buf.writeInt32LE(size, offset + 4);
  buf.writeInt32LE(size * 2, offset + 8); // double height for mask
  buf.writeUInt16LE(1, offset + 12); // planes
  buf.writeUInt16LE(32, offset + 14); // bit count
  buf.writeUInt32LE(0, offset + 16); // BI_RGB
  buf.writeUInt32LE(imageSize, offset + 20);
  buf.writeInt32LE(0, offset + 24);
  buf.writeInt32LE(0, offset + 28);
  buf.writeUInt32LE(0, offset + 32);
  buf.writeUInt32LE(0, offset + 36);

  offset += dibHeaderSize;

  // BMP rows are bottom to top, BGRA format
  for (let y = size - 1; y >= 0; y--) {
    for (let x = 0; x < size; x++) {
      const srcIdx = (y * size + x) * 4;
      buf.writeUInt8(pixels[srcIdx + 2], offset++); // B
      buf.writeUInt8(pixels[srcIdx + 1], offset++); // G
      buf.writeUInt8(pixels[srcIdx + 0], offset++); // R
      buf.writeUInt8(pixels[srcIdx + 3], offset++); // A
    }
  }

  // AND mask (all zeros for 32-bit RGBA)
  buf.fill(0, offset, offset + maskSize);

  return buf;
}

const size = 32;
const pixels = renderFavicon(size);
const icoBuffer = createIco(size, pixels);

const outDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'favicon.ico'), icoBuffer);
console.log('Successfully generated public/favicon.ico (' + icoBuffer.length + ' bytes)');
