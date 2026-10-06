import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA color type
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw image data with 1 byte filter per scanline
  const rowStride = width * 4;
  const rawData = Buffer.alloc((rowStride + 1) * height);
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.45;
  const innerRadius = width * 0.28;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= innerRadius) {
        // Core symbol (soft warm cream / light green)
        rawData[offset++] = 245; // R
        rawData[offset++] = 250; // G
        rawData[offset++] = 246; // B
        rawData[offset++] = 255; // A
      } else if (dist <= radius) {
        // Outer brand shield (sage teal #2D6A4F)
        rawData[offset++] = 45;  // R
        rawData[offset++] = 106; // G
        rawData[offset++] = 79;  // B
        rawData[offset++] = 255; // A
      } else {
        // Transparent or soft background
        rawData[offset++] = 45;
        rawData[offset++] = 106;
        rawData[offset++] = 79;
        rawData[offset++] = 0;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const buf = Buffer.alloc(12 + length);
  buf.writeUInt32BE(length, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crc = crc32(buf.subarray(4, 8 + length));
  buf.writeInt32BE(crc, 8 + length);
  return buf;
}

// CRC32 implementation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ 0xffffffff;
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('public/pwa-192x192.png', createPng(192, 192, 45, 106, 79));
fs.writeFileSync('public/pwa-512x512.png', createPng(512, 512, 45, 106, 79));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPng(512, 512, 45, 106, 79));
fs.writeFileSync('public/apple-touch-icon.png', createPng(180, 180, 45, 106, 79));
fs.writeFileSync('public/favicon.ico', createPng(32, 32, 45, 106, 79));
console.log('PWA icons successfully generated.');
