import sharp from 'sharp';
import { writeFileSync } from 'fs';

const WIDTH = 1200;
const HEIGHT = 630;

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a1a1a"/>
      <stop offset="50%" stop-color="#2d7a2d"/>
      <stop offset="100%" stop-color="#e74c3c"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  
  <!-- Green bottom accent -->
  <rect y="${HEIGHT - 6}" width="${WIDTH}" height="6" fill="#00A859"/>
  
  <!-- Logo -->
  <text x="80" y="120" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="bold" fill="#ffffff">JANJEZ</text>
  
  <!-- Headline -->
  <text x="80" y="320" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="bold" fill="#ffffff">
    Kenya's Plug for
  </text>
  <text x="80" y="400" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="bold" fill="#ffffff">
    Instant Social Clout
  </text>
  
  <!-- Tagline -->
  <text x="80" y="500" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#ffffff" opacity="0.8">
    Social Media Marketing Services
  </text>
  
  <!-- URL -->
  <text x="80" y="${HEIGHT - 60}" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="bold" fill="#ffffff">janjez.social</text>
</svg>
`;

const buffer = await sharp(Buffer.from(svg))
  .png({ quality: 90, compressionLevel: 9 })
  .toBuffer();

writeFileSync('public/og-image.png', buffer);
console.log(`og-image.png regenerated: ${buffer.length} bytes (${(buffer.length/1024).toFixed(1)} KB)`);
