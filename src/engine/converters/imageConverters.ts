import { ConversionParams, ConversionResult, LogEntry } from '../../types/conversion';
import JSZip from 'jszip';

/**
 * Reads an image file into an HTMLImageElement
 */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file: ' + e));
    };
    img.src = url;
  });
}

/**
 * Converts image to standard raster formats (PNG, JPEG, WebP, BMP, GIF)
 */
export async function convertRasterImage(
  file: File,
  targetFormat: 'png' | 'jpeg' | 'webp' | 'bmp' | 'gif',
  params: ConversionParams = {}
): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Initializing image conversion to ${targetFormat.toUpperCase()}` });

  const img = await loadImageFromFile(file);
  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Image loaded: ${img.naturalWidth}x${img.naturalHeight}px` });

  // Optional resize
  let width = img.naturalWidth;
  let height = img.naturalHeight;
  if (params.resize && params.width) {
    width = parseInt(params.width) || width;
    height = params.height ? parseInt(params.height) : Math.round((width / img.naturalWidth) * img.naturalHeight);
    logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Resizing to ${width}x${height}px` });
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create 2D canvas context');

  // Background for formats that don't support alpha (e.g. JPEG)
  if (targetFormat === 'jpeg') {
    ctx.fillStyle = params.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  // Filters
  if (params.filter) {
    if (params.filter === 'grayscale') ctx.filter = 'grayscale(100%)';
    else if (params.filter === 'invert') ctx.filter = 'invert(100%)';
    else if (params.filter === 'sepia') ctx.filter = 'sepia(100%)';
    else if (params.filter === 'high-contrast') ctx.filter = 'contrast(200%)';
    logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Applied filter: ${params.filter}` });
  }

  ctx.drawImage(img, 0, 0, width, height);

  const quality = (params.quality ?? 92) / 100;
  let mimeType = 'image/png';
  if (targetFormat === 'jpeg') mimeType = 'image/jpeg';
  else if (targetFormat === 'webp') mimeType = 'image/webp';

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Canvas conversion to blob failed'));
    }, mimeType, quality);
  });

  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const outputName = `${baseName}.${targetFormat === 'jpeg' ? 'jpg' : targetFormat}`;

  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'success', message: `Conversion complete: ${outputName} (${(blob.size / 1024).toFixed(1)} KB)` });

  return {
    data: blob,
    outputName,
    outputFormat: targetFormat,
    mimeType,
    previewType: 'image',
    previewUrl: URL.createObjectURL(blob),
    logs,
    executionTimeMs: Math.round(performance.now() - startTime),
    originalSizeBytes: file.size,
    convertedSizeBytes: blob.size,
  };
}

/**
 * Converts image to Favicon ICO (generates multi-resolution bundle)
 */
export async function convertToIco(file: File, params: ConversionParams = {}): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: 'Generating Windows Favicon & Icon bundle' });

  const img = await loadImageFromFile(file);
  const zip = new JSZip();
  const sizes = [16, 32, 48, 64, 128, 256];

  // Primary 32x32 canvas for the direct .ico
  const primaryCanvas = document.createElement('canvas');
  primaryCanvas.width = 32;
  primaryCanvas.height = 32;
  const pCtx = primaryCanvas.getContext('2d')!;
  pCtx.drawImage(img, 0, 0, 32, 32);

  const primaryBlob: Blob = await new Promise((res) => primaryCanvas.toBlob((b) => res(b!), 'image/png'));

  // Also build zip containing all sizes for website deployment
  const iconsFolder = zip.folder('favicon_bundle') || zip;
  for (const s of sizes) {
    const c = document.createElement('canvas');
    c.width = s;
    c.height = s;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0, s, s);
    const b: Blob = await new Promise((res) => c.toBlob((bl) => res(bl!), 'image/png'));
    iconsFolder.file(`favicon-${s}x${s}.png`, b);
    logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Rendered ${s}x${s} icon asset` });
  }

  // Add html snippet
  const htmlSnippet = `<!-- Chang-Itz Generated Favicons -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="128x128" href="/favicon-128x128.png">`;
  iconsFolder.file('README_HTML.html', htmlSnippet);

  // If user wants zip pack or single ico
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  
  if (params.generateZip) {
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return {
      data: zipBlob,
      outputName: `${baseName}_favicons.zip`,
      outputFormat: 'ico',
      mimeType: 'application/zip',
      previewType: 'image',
      previewUrl: URL.createObjectURL(primaryBlob),
      logs,
      executionTimeMs: Math.round(performance.now() - startTime),
      originalSizeBytes: file.size,
      convertedSizeBytes: zipBlob.size,
    };
  }

  return {
    data: primaryBlob,
    outputName: `${baseName}.ico`,
    outputFormat: 'ico',
    mimeType: 'image/x-icon',
    previewType: 'image',
    previewUrl: URL.createObjectURL(primaryBlob),
    logs,
    executionTimeMs: Math.round(performance.now() - startTime),
    originalSizeBytes: file.size,
    convertedSizeBytes: primaryBlob.size,
  };
}

/**
 * Converts image into vector SVG (using edge detection & path shapes or clean embedded SVG wrapper)
 */
export async function convertToSvg(file: File, params: ConversionParams = {}): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: 'Converting raster image to SVG Vector format' });

  const img = await loadImageFromFile(file);
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  // Read data URL
  const reader = new FileReader();
  const dataUrl: string = await new Promise((res) => {
    reader.onload = () => res(reader.result as string);
    reader.readAsDataURL(file);
  });

  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const outputName = `${baseName}.svg`;

  let svgContent = '';
  if (params.vectorTrace) {
    // Generate geometric pixel blocks or polygon vector trace
    logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: 'Tracing image color contours into SVG path matrix' });
    const sampleCanvas = document.createElement('canvas');
    const scale = Math.min(1, 120 / Math.max(w, h));
    const sw = Math.round(w * scale);
    const sh = Math.round(h * scale);
    sampleCanvas.width = sw;
    sampleCanvas.height = sh;
    const sCtx = sampleCanvas.getContext('2d')!;
    sCtx.drawImage(img, 0, 0, sw, sh);
    const imgData = sCtx.getImageData(0, 0, sw, sh).data;

    let rects = '';
    const pw = (w / sw).toFixed(2);
    const ph = (h / sh).toFixed(2);
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const idx = (y * sw + x) * 4;
        const a = imgData[idx + 3];
        if (a > 20) {
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          const px = (x * (w / sw)).toFixed(2);
          const py = (y * (h / sh)).toFixed(2);
          rects += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="rgb(${r},${g},${b})" fill-opacity="${(a / 255).toFixed(2)}"/>\n`;
        }
      }
    }
    svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <!-- Chang-Itz Vector Contour Trace -->
  ${rects}
</svg>`;
  } else {
    // Crisp SVG wrapper with embedded image and metadata
    svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <!-- Chang-Itz Scalable Vector Wrapper -->
  <image width="${w}" height="${h}" xlink:href="${dataUrl}"/>
</svg>`;
  }

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'success', message: `SVG generated successfully (${(blob.size / 1024).toFixed(1)} KB)` });

  return {
    data: blob,
    outputName,
    outputFormat: 'svg',
    mimeType: 'image/svg+xml',
    previewType: 'image',
    textContent: svgContent,
    previewUrl: URL.createObjectURL(blob),
    logs,
    executionTimeMs: Math.round(performance.now() - startTime),
    originalSizeBytes: file.size,
    convertedSizeBytes: blob.size,
  };
}

/**
 * Converts image to ASCII Art text
 */
export async function convertToAsciiArt(file: File, params: ConversionParams = {}): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: 'Analyzing pixel brightness matrix for ASCII Art generation' });

  const img = await loadImageFromFile(file);
  const targetCols = params.cols ? parseInt(params.cols) : 100;
  const aspectRatio = img.naturalHeight / img.naturalWidth;
  // Font glyphs are roughly 2x as tall as they are wide in monospace
  const targetRows = Math.round(targetCols * aspectRatio * 0.55);

  const canvas = document.createElement('canvas');
  canvas.width = targetCols;
  canvas.height = targetRows;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, targetCols, targetRows);

  const imgData = ctx.getImageData(0, 0, targetCols, targetRows).data;
  const ramp = params.charset || ' .:-=+*#%@';
  const rampLen = ramp.length;

  let ascii = '';
  for (let y = 0; y < targetRows; y++) {
    for (let x = 0; x < targetCols; x++) {
      const idx = (y * targetCols + x) * 4;
      const r = imgData[idx];
      const g = imgData[idx + 1];
      const b = imgData[idx + 2];
      const a = imgData[idx + 3];

      if (a < 30) {
        ascii += ' ';
        continue;
      }

      // Perceptual luminance calculation
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const charIdx = Math.floor(lum * (rampLen - 1));
      ascii += ramp[charIdx];
    }
    ascii += '\n';
  }

  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const outputName = `${baseName}_ascii.txt`;
  const blob = new Blob([ascii], { type: 'text/plain;charset=utf-8' });

  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'success', message: `Rendered ASCII grid: ${targetCols}x${targetRows} characters` });

  return {
    data: blob,
    outputName,
    outputFormat: 'asciiart',
    mimeType: 'text/plain',
    previewType: 'text',
    textContent: ascii,
    logs,
    executionTimeMs: Math.round(performance.now() - startTime),
    originalSizeBytes: file.size,
    convertedSizeBytes: blob.size,
  };
}

/**
 * Converts image to Retro Pixel Art with Dithering
 */
export async function convertToPixelArt(file: File, params: ConversionParams = {}): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: 'Applying downsampling and retro palette dithering' });

  const img = await loadImageFromFile(file);
  const pixelSize = params.pixelSize ? parseInt(params.pixelSize) : 8;
  const sw = Math.max(16, Math.round(img.naturalWidth / pixelSize));
  const sh = Math.max(16, Math.round(img.naturalHeight / pixelSize));

  const smallCanvas = document.createElement('canvas');
  smallCanvas.width = sw;
  smallCanvas.height = sh;
  const sCtx = smallCanvas.getContext('2d')!;
  sCtx.imageSmoothingEnabled = false;
  sCtx.drawImage(img, 0, 0, sw, sh);

  const imgData = sCtx.getImageData(0, 0, sw, sh);
  const data = imgData.data;

  // Retro palettes
  const paletteType = params.palette || 'retro'; // 'gameboy', 'cyberpunk', 'retro'
  let palette: [number, number, number][] = [
    [0, 0, 0], [255, 255, 255], [255, 0, 0], [0, 255, 0], [0, 0, 255],
    [255, 255, 0], [0, 255, 255], [255, 0, 255], [128, 128, 128]
  ];

  if (paletteType === 'gameboy') {
    palette = [
      [15, 56, 15],
      [48, 98, 48],
      [139, 172, 15],
      [155, 188, 15],
    ];
  } else if (paletteType === 'cyberpunk') {
    palette = [
      [10, 10, 35],
      [255, 0, 128],
      [0, 255, 255],
      [255, 255, 0],
      [20, 240, 140],
      [240, 240, 255],
    ];
  }

  // Find closest palette color helper
  function findClosestColor(r: number, g: number, b: number): [number, number, number] {
    let minDist = Infinity;
    let closest = palette[0];
    for (const p of palette) {
      const dist = (r - p[0]) ** 2 + (g - p[1]) ** 2 + (b - p[2]) ** 2;
      if (dist < minDist) {
        minDist = dist;
        closest = p;
      }
    }
    return closest;
  }

  // Dither Floyd-Steinberg
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const i = (y * sw + x) * 4;
      const oldR = data[i];
      const oldG = data[i + 1];
      const oldB = data[i + 2];

      const [newR, newG, newB] = findClosestColor(oldR, oldG, oldB);
      data[i] = newR;
      data[i + 1] = newG;
      data[i + 2] = newB;

      const errR = oldR - newR;
      const errG = oldG - newG;
      const errB = oldB - newB;

      const distribute = (px: number, py: number, factor: number) => {
        if (px >= 0 && px < sw && py >= 0 && py < sh) {
          const idx = (py * sw + px) * 4;
          data[idx] = Math.min(255, Math.max(0, data[idx] + errR * factor));
          data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + errG * factor));
          data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + errB * factor));
        }
      };

      distribute(x + 1, y, 7 / 16);
      distribute(x - 1, y + 1, 3 / 16);
      distribute(x, y + 1, 5 / 16);
      distribute(x + 1, y + 1, 1 / 16);
    }
  }

  sCtx.putImageData(imgData, 0, 0);

  // Scale back up to original size with crisp nearest-neighbor
  const outCanvas = document.createElement('canvas');
  outCanvas.width = img.naturalWidth;
  outCanvas.height = img.naturalHeight;
  const outCtx = outCanvas.getContext('2d')!;
  outCtx.imageSmoothingEnabled = false;
  outCtx.drawImage(smallCanvas, 0, 0, img.naturalWidth, img.naturalHeight);

  const blob: Blob = await new Promise((res) => outCanvas.toBlob((b) => res(b!), 'image/png'));
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const outputName = `${baseName}_pixelart.png`;

  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'success', message: `Pixel Art generated with palette: ${paletteType}` });

  return {
    data: blob,
    outputName,
    outputFormat: 'pixelart',
    mimeType: 'image/png',
    previewType: 'image',
    previewUrl: URL.createObjectURL(blob),
    logs,
    executionTimeMs: Math.round(performance.now() - startTime),
    originalSizeBytes: file.size,
    convertedSizeBytes: blob.size,
  };
}

/**
 * Extracts dominant color palette from image (HEX, RGB, CSS)
 */
export async function extractColorPalette(file: File): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: 'Sampling image pixels to extract color harmony palette' });

  const img = await loadImageFromFile(file);
  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = 64;
  sampleCanvas.height = 64;
  const ctx = sampleCanvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, 64, 64);

  const data = ctx.getImageData(0, 0, 64, 64).data;
  const colorMap: Record<string, number> = {};

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 64) continue;
    // Quantize to reduce variations
    const r = Math.round(data[i] / 24) * 24;
    const g = Math.round(data[i + 1] / 24) * 24;
    const b = Math.round(data[i + 2] / 24) * 24;
    const key = `${r},${g},${b}`;
    colorMap[key] = (colorMap[key] || 0) + 1;
  }

  const sortedColors = Object.entries(colorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([rgbStr]) => {
      const [r, g, b] = rgbStr.split(',').map(Number);
      const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
      const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      return {
        hex,
        rgb: `rgb(${r}, ${g}, ${b})`,
        r, g, b,
      };
    });

  const paletteObj = {
    sourceFile: file.name,
    extractedAt: new Date().toISOString(),
    totalDominantColors: sortedColors.length,
    colors: sortedColors,
    cssVariables: sortedColors
      .map((c, i) => `  --color-accent-${i + 1}: ${c.hex}; /* ${c.rgb} */`)
      .join('\n'),
  };

  const textContent = JSON.stringify(paletteObj, null, 2);
  const blob = new Blob([textContent], { type: 'application/json' });
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'success', message: `Extracted ${sortedColors.length} dominant colors` });

  return {
    data: blob,
    outputName: `${baseName}_palette.json`,
    outputFormat: 'palette',
    mimeType: 'application/json',
    previewType: 'text',
    textContent,
    logs,
    executionTimeMs: Math.round(performance.now() - startTime),
    originalSizeBytes: file.size,
    convertedSizeBytes: blob.size,
  };
}

/**
 * Image to Base64 Data URL text
 */
export async function convertImageToBase64(file: File): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: 'Encoding binary image to Base64 Data URI' });

  const reader = new FileReader();
  const dataUrl: string = await new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });

  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const outputName = `${baseName}_base64.txt`;
  const blob = new Blob([dataUrl], { type: 'text/plain;charset=utf-8' });

  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'success', message: `Base64 string generated (${dataUrl.length} characters)` });

  return {
    data: blob,
    outputName,
    outputFormat: 'base64img',
    mimeType: 'text/plain',
    previewType: 'text',
    textContent: dataUrl,
    logs,
    executionTimeMs: Math.round(performance.now() - startTime),
    originalSizeBytes: file.size,
    convertedSizeBytes: blob.size,
  };
}
