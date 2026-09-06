import fs from 'fs';
import path from 'path';
import { deflateSync } from 'zlib';

const blogDir = path.join(process.cwd(), 'public/blog');
if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });

const covers = [
  { name: 'navigate-pro-cover.png', r: 0, g: 168, b: 89 },
  { name: 'youtube-monetization-cover.png', r: 255, g: 0, b: 0 },
  { name: 'x-twitter-viral-cover.png', r: 29, g: 161, b: 242 },
  { name: 'facebook-monetization-cover.png', r: 24, g: 119, b: 242 },
  { name: 'tiktok-growth-cover.png', r: 30, g: 255, b: 127 },
  { name: 'instagram-ban-safety-cover.png', r: 228, g: 64, b: 114 },
  { name: 'cheapest-smm-services-cover.png', r: 0, g: 168, b: 89 },
  { name: 'build-agency-cover.png', r: 107, g: 70, b: 193 },
  { name: 'mpesa-payments-cover.png', r: 0, g: 168, b: 89 },
  { name: 'social-revenue-cover.png', r: 217, g: 119, b: 6 },
];

const inline = [
  { name: 'nav-homepage.png', r: 0, g: 168, b: 89 },
  { name: 'order-tracking.png', r: 0, g: 168, b: 89 },
  { name: 'youtube-requirements.png', r: 255, g: 0, b: 0 },
  { name: 'x-algorithm-2025.png', r: 29, g: 161, b: 242 },
  { name: 'facebook-monetization-requirements.png', r: 24, g: 119, b: 242 },
  { name: 'tiktok-algorithm.png', r: 30, g: 255, b: 127 },
  { name: 'instagram-ban-types.png', r: 228, g: 64, b: 114 },
  { name: 'cheap-vs-affordable.png', r: 0, g: 168, b: 89 },
  { name: 'agency-niche.png', r: 107, g: 70, b: 193 },
  { name: 'mpesa-flow.png', r: 0, g: 168, b: 89 },
  { name: 'monetization-models.png', r: 217, g: 119, b: 6 },
];

function createPng(width, height, r, g, b) {
  const widthBytes = width * 4;
  const rawData = Buffer.alloc(widthBytes * height);
  const border = 40;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * widthBytes) + (x * 4);
      
      if (x < border || x >= width - border || y < border || y >= height - border) {
        rawData[idx] = 255;
        rawData[idx + 1] = 255;
        rawData[idx + 2] = 255;
        rawData[idx + 3] = 255;
      } else {
        const gradientFactor = (y - border) / (height - border * 2);
        const factor = 1 - gradientFactor * 0.5;
        rawData[idx] = Math.min(255, Math.max(0, r * factor));
        rawData[idx + 1] = Math.min(255, Math.max(0, g * factor));
        rawData[idx + 2] = Math.min(255, Math.max(0, b * factor));
        rawData[idx + 3] = 255;
      }
    }
  }

  const compressed = deflateSync(rawData);
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  function chunk(type, data) {
    const typeBuffer = Buffer.from(type, 'ascii');
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const crcData = Buffer.concat([typeBuffer, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcData), 0);
    return Buffer.concat([length, typeBuffer, data, crc]);
  }

  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        if (c & 1) c = 0xEDB88320 ^ (c >>> 1);
        else c = c >>> 1;
      }
      table[n] = c;
    }
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

console.log('Generating blog images...');
let count = 0;

covers.forEach(({ name, r, g, b }) => {
  const filePath = path.join(blogDir, name);
  const png = createPng(1200, 630, r, g, b);
  fs.writeFileSync(filePath, png);
  console.log(`Created cover: ${name} (${png.length} bytes)`);
  count++;
});

inline.forEach(({ name, r, g, b }) => {
  const filePath = path.join(blogDir, name);
  const png = createPng(1200, 630, r, g, b);
  fs.writeFileSync(filePath, png);
  console.log(`Created inline: ${name} (${png.length} bytes)`);
  count++;
});

console.log(`\nDone: ${count} images generated`);
