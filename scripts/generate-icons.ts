import { createCanvas } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

const CORAL = '#FF6B5B';
const WHITE = '#FFFFFF';
const ICONS_DIR = path.join(__dirname, '../public/assets/icons');

const ICON_SIZES = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32.png' },
  { size: 16, name: 'favicon-16.png' },
];

const MASKABLE_SIZES = [
  { size: 192, name: 'icon-maskable-192.png' },
  { size: 512, name: 'icon-maskable-512.png' },
];

function drawRoundedRect(ctx: any, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawWrench(ctx: any, centerX: number, centerY: number, size: number, rotation: number = -Math.PI / 6) {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);
  
  const wrenchLength = size * 0.6;
  const handleWidth = size * 0.12;
  const headWidth = size * 0.22;
  const headHeight = size * 0.18;
  
  ctx.fillStyle = WHITE;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = size * 0.03;
  ctx.shadowOffsetX = size * 0.01;
  ctx.shadowOffsetY = size * 0.01;
  
  ctx.beginPath();
  ctx.roundRect(-handleWidth / 2, -wrenchLength / 2, handleWidth, wrenchLength, handleWidth / 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.roundRect(-headWidth / 2, -wrenchLength / 2 - headHeight / 2, headWidth, headHeight, headWidth / 4);
  ctx.fill();
  
  const gapWidth = headWidth * 0.35;
  const gapHeight = headHeight * 0.6;
  ctx.fillStyle = CORAL;
  ctx.beginPath();
  ctx.roundRect(-gapWidth / 2, -wrenchLength / 2 - headHeight / 2 + (headHeight - gapHeight) / 2, gapWidth, gapHeight, gapWidth / 4);
  ctx.fill();
  
  ctx.restore();
}

function createIcon(size: number, maskable: boolean = false): Buffer {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  const padding = maskable ? size * 0.1 : 0;
  const iconSize = size - padding * 2;
  const cornerRadius = iconSize * 0.2;
  
  drawRoundedRect(ctx, padding, padding, iconSize, iconSize, cornerRadius);
  ctx.fillStyle = CORAL;
  ctx.fill();
  
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = size * 0.02;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = size * 0.01;
  ctx.fill();
  
  drawWrench(ctx, size / 2, size / 2, iconSize * 0.6);
  
  return canvas.toBuffer('image/png');
}

function createFavicon(): Buffer {
  const size = 16;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  const cornerRadius = size * 0.2;
  drawRoundedRect(ctx, 0, 0, size, size, cornerRadius);
  ctx.fillStyle = CORAL;
  ctx.fill();
  
  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.roundRect(6, 2, 4, 12, 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(4, 1, 8, 3, 1);
  ctx.fill();
  
  return canvas.toBuffer('image/png');
}

function createIco(): Buffer {
  const png16 = createIcon(16);
  const png32 = createIcon(32);
  const png48 = createIcon(48);
  
  const headerSize = 6;
  const entrySize = 16;
  const dataOffset = headerSize + entrySize * 3;
  
  const totalSize = dataOffset + png16.length + png32.length + png48.length;
  const buffer = Buffer.alloc(totalSize);
  
  buffer.writeUInt16LE(0, 0);
  buffer.writeUInt16LE(1, 2);
  buffer.writeUInt16LE(3, 4);
  
  let offset = dataOffset;
  
  buffer.writeUInt8(16, 6);
  buffer.writeUInt8(16, 7);
  buffer.writeUInt8(0, 8);
  buffer.writeUInt8(0, 9);
  buffer.writeUInt16LE(1, 10);
  buffer.writeUInt16LE(32, 12);
  buffer.writeUInt32LE(png16.length, 14);
  buffer.writeUInt32LE(offset, 18);
  offset += png16.length;
  
  buffer.writeUInt8(32, 22);
  buffer.writeUInt8(32, 23);
  buffer.writeUInt8(0, 24);
  buffer.writeUInt8(0, 25);
  buffer.writeUInt16LE(1, 26);
  buffer.writeUInt16LE(32, 28);
  buffer.writeUInt32LE(png32.length, 30);
  buffer.writeUInt32LE(offset, 34);
  offset += png32.length;
  
  buffer.writeUInt8(48, 38);
  buffer.writeUInt8(48, 39);
  buffer.writeUInt8(0, 40);
  buffer.writeUInt8(0, 41);
  buffer.writeUInt16LE(1, 42);
  buffer.writeUInt16LE(32, 44);
  buffer.writeUInt32LE(png48.length, 46);
  buffer.writeUInt32LE(offset, 50);
  
  let dataPos = dataOffset;
  png16.copy(buffer, dataPos);
  dataPos += png16.length;
  png32.copy(buffer, dataPos);
  dataPos += png32.length;
  png48.copy(buffer, dataPos);
  
  return buffer;
}

function main() {
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }
  
  console.log('Generating PWA icons...\n');
  
  for (const { size, name } of ICON_SIZES) {
    const buffer = createIcon(size);
    const outputPath = path.join(ICONS_DIR, name);
    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ Created ${name} (${size}x${size})`);
  }
  
  for (const { size, name } of MASKABLE_SIZES) {
    const buffer = createIcon(size, true);
    const outputPath = path.join(ICONS_DIR, name);
    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ Created ${name} (${size}x${size}, maskable)`);
  }
  
  const faviconIco = createIco();
  fs.writeFileSync(path.join(ICONS_DIR, 'favicon.ico'), faviconIco);
  console.log('✓ Created favicon.ico\n');
  
  console.log('All icons generated successfully!');
}

main();
