// Pads a PNG onto a transparent square canvas, centered, so browsers don't stretch it as a favicon.
// Handles the common case only: 8-bit, non-interlaced RGBA or RGB. No image library needed.
import { crc32, deflateSync, inflateSync } from 'node:zlib';

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function readChunks(png) {
  const chunks = [];
  for (let at = 8; at < png.length; ) {
    const length = png.readUInt32BE(at);
    chunks.push({ type: png.toString('ascii', at + 4, at + 8), data: png.subarray(at + 8, at + 8 + length) });
    at += 12 + length;
  }
  return chunks;
}

function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])) >>> 0, 0);
  return Buffer.concat([head, data, crc]);
}

/** Reverses PNG row filters; returns tightly packed pixel rows. */
function unfilter(raw, width, height, bpp) {
  const stride = width * bpp;
  const out = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    const row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x += 1) {
      const a = x >= bpp ? out[y * stride + x - bpp] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? out[(y - 1) * stride + x - bpp] : 0;
      let v = row[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[y * stride + x] = v & 0xff;
    }
  }
  return out;
}

export function squarePng(png) {
  if (!png.subarray(0, 8).equals(SIGNATURE)) throw new Error('Not a PNG');
  const chunks = readChunks(png);
  const ihdr = chunks.find((c) => c.type === 'IHDR').data;
  const width = ihdr.readUInt32BE(0);
  const height = ihdr.readUInt32BE(4);
  const [depth, colorType, , , interlace] = ihdr.subarray(8, 13);
  if (depth !== 8 || interlace !== 0 || (colorType !== 6 && colorType !== 2)) {
    throw new Error('squarePng supports 8-bit, non-interlaced RGB/RGBA PNGs only');
  }
  if (width === height) return png;

  const bpp = colorType === 6 ? 4 : 3;
  const pixels = unfilter(inflateSync(Buffer.concat(chunks.filter((c) => c.type === 'IDAT').map((c) => c.data))), width, height, bpp);

  const size = Math.max(width, height);
  const left = Math.floor((size - width) / 2);
  const top = Math.floor((size - height) / 2);
  const rows = Buffer.alloc(size * (size * 4 + 1)); // filter byte 0 + transparent RGBA
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const src = (y * width + x) * bpp;
      const dst = (top + y) * (size * 4 + 1) + 1 + (left + x) * 4;
      rows[dst] = pixels[src];
      rows[dst + 1] = pixels[src + 1];
      rows[dst + 2] = pixels[src + 2];
      rows[dst + 3] = bpp === 4 ? pixels[src + 3] : 255;
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([SIGNATURE, chunk('IHDR', header), chunk('IDAT', deflateSync(rows)), chunk('IEND', Buffer.alloc(0))]);
}
