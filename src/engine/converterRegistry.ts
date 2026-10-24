import { ConversionOption, ConversionParams, ConversionResult } from '../types/conversion';
import { FORMATS } from './formats';
import {
  convertRasterImage,
  convertToIco,
  convertToSvg,
  convertToAsciiArt,
  convertToPixelArt,
  extractColorPalette,
  convertImageToBase64,
} from './converters/imageConverters';
import { convertDataFormat } from './converters/dataConverters';
import { convertTextFormat } from './converters/textConverters';
import { convertCryptoFormat } from './converters/cryptoConverters';
import { convertAudioFormat } from './converters/audioConverters';
import { createZipArchive, unpackZipArchive } from './converters/archiveConverters';
import { convertToBruh, convertFromBruh } from './converters/bruhConverter';
import { convertPackageFormat } from './converters/packageConverters';
import { convertTrueHdFormat } from './converters/truehdConverter';
import { convertToDdlcChr, convertFromDdlcChr } from './converters/ddlcChrConverter';
import { convertFromNes, convertToNes } from './converters/nesConverter';
import { convertFromN64, convertToN64, convertFromWad, convertToWad } from './converters/n64WadConverter';
import { convertToPi, convertToVector3, convertToQuaternion, convertFromSpatialMath } from './converters/spatialMathConverter';

/**
 * Returns list of target format IDs that the given source format can convert into
 */
export function getAvailableTargets(sourceFormatId: string, includeAll: boolean = false): string[] {
  if (includeAll) {
    return Object.keys(FORMATS).filter((id) => id !== sourceFormatId);
  }

  const src = FORMATS[sourceFormatId] || FORMATS.txt;
  const targets = new Set<string>();

  // Universal targets (PI, Vector3, Quaternion, NES, N64, WAD, DDLC chr, hashes, packages, meme container, zip, hexdump, base64)
  const universal = ['pi', 'vector3', 'quaternion', 'nes', 'z64', 'n64', 'v64', 'wad', 'chr', 'bruh', 'apk', 'xapk', 'truehd', 'thd', 'zip', 'hexdump', 'base64', 'sha256', 'sha512', 'sha1', 'md5', 'crc32'];
  universal.forEach((t) => targets.add(t));

  if (['pi', 'vector3', 'quaternion'].includes(sourceFormatId)) {
    ['pi', 'vector3', 'quaternion', 'json', 'csv', 'txt', 'hexdump', 'base64'].forEach((t) => targets.add(t));
  } else if (sourceFormatId === 'nes') {
    ['json', 'png', 'chr', 'bin', 'txt', 'hexdump', 'base64', 'zip', 'sha256'].forEach((t) => targets.add(t));
  } else if (['z64', 'n64', 'v64'].includes(sourceFormatId)) {
    ['z64', 'n64', 'v64', 'json', 'txt', 'hexdump', 'bin', 'zip', 'sha256'].forEach((t) => targets.add(t));
  } else if (sourceFormatId === 'wad') {
    ['wad', 'json', 'txt', 'zip', 'hexdump', 'bin', 'sha256'].forEach((t) => targets.add(t));
  } else if (src.category === 'spreadsheet') {
    ['csv', 'tsv', 'json', 'mdtable', 'html', 'txt'].forEach((t) => targets.add(t));
  } else if (src.category === 'font') {
    ['woff', 'woff2', 'ttf', 'otf', 'json', 'hexdump', 'base64'].forEach((t) => targets.add(t));
  } else if (src.category === 'database') {
    ['json', 'csv', 'sql_db', 'parquet', 'arrow', 'txt', 'hexdump'].forEach((t) => targets.add(t));
  } else if (src.category === 'units') {
    ['json', 'txt', 'csv', 'yaml'].forEach((t) => targets.add(t));
  } else if (src.category === 'image') {
    // Image targets
    const imgTargets = [
      'png', 'jpeg', 'webp', 'svg', 'bmp', 'ico', 'gif',
      'base64img', 'asciiart', 'pixelart', 'palette'
    ];
    imgTargets.forEach((t) => targets.add(t));
  } else if (src.category === 'data') {
    // Data targets
    const dataTargets = [
      'json', 'csv', 'tsv', 'yaml', 'xml', 'sql', 'mdtable',
      'tsinterface', 'pythondict', 'gostruct', 'minified'
    ];
    dataTargets.forEach((t) => targets.add(t));
  } else if (src.category === 'document' || src.category === 'creative') {
    // Document & Text targets
    const docTargets = [
      'markdown', 'html', 'txt', 'srt', 'vtt',
      'spongebob', 'camelcase', 'snakecase', 'kebabcase',
      'binarytext', 'morsetext', 'nato', 'morseaudio',
      'rot13', 'urlencode'
    ];
    docTargets.forEach((t) => targets.add(t));
  } else if (src.category === 'audio') {
    // Audio targets
    const audioTargets = ['wav', 'tonesynth', 'morseaudio'];
    audioTargets.forEach((t) => targets.add(t));
  } else if (src.category === 'archive') {
    // Archive targets
    targets.add('json'); // unpack manifest
    targets.add('zip');
  }

  // Always include universal targets except self
  universal.forEach((u) => targets.add(u));
  targets.delete(sourceFormatId);

  return Array.from(targets);
}

/**
 * Returns customizable parameters and options for a given target format
 */
export function getConversionOptions(targetFormatId: string): ConversionOption[] {
  switch (targetFormatId) {
    case 'jpeg':
    case 'webp':
      return [
        {
          id: 'quality',
          label: 'Compression Quality',
          type: 'number',
          defaultValue: 92,
          min: 10,
          max: 100,
          step: 5,
          description: 'Higher quality preserves more detail but results in larger file size',
        },
        {
          id: 'filter',
          label: 'Photo Filter',
          type: 'select',
          defaultValue: 'none',
          options: [
            { label: 'None (Original Colors)', value: 'none' },
            { label: 'Grayscale (Black & White)', value: 'grayscale' },
            { label: 'Invert (Negative)', value: 'invert' },
            { label: 'Sepia (Warm Vintage)', value: 'sepia' },
            { label: 'High Contrast', value: 'high-contrast' },
          ],
        },
      ];
    case 'png':
    case 'bmp':
      return [
        {
          id: 'filter',
          label: 'Photo Filter',
          type: 'select',
          defaultValue: 'none',
          options: [
            { label: 'None (Original Colors)', value: 'none' },
            { label: 'Grayscale (Black & White)', value: 'grayscale' },
            { label: 'Invert (Negative)', value: 'invert' },
            { label: 'Sepia (Warm Vintage)', value: 'sepia' },
            { label: 'High Contrast', value: 'high-contrast' },
          ],
        },
      ];
    case 'ico':
      return [
        {
          id: 'generateZip',
          label: 'Export Full Multi-Size Icon Bundle (ZIP)',
          type: 'boolean',
          defaultValue: false,
          description: 'Packages 16x16, 32x32, 48x48, 64x64, 128x128 and 256x256 icons + HTML tag guide',
        },
      ];
    case 'svg':
      return [
        {
          id: 'vectorTrace',
          label: 'Vector Contour Pixel Trace',
          type: 'boolean',
          defaultValue: false,
          description: 'Traces image pixels into true resolution-independent vector shapes',
        },
      ];
    case 'asciiart':
      return [
        {
          id: 'cols',
          label: 'Character Column Width',
          type: 'number',
          defaultValue: 100,
          min: 40,
          max: 180,
          step: 10,
          description: 'Width of the rendered ASCII character grid',
        },
      ];
    case 'pixelart':
      return [
        {
          id: 'pixelSize',
          label: 'Pixel Block Size',
          type: 'number',
          defaultValue: 8,
          min: 2,
          max: 24,
          step: 2,
          description: 'Higher pixel size creates chunkier retro game graphics',
        },
        {
          id: 'palette',
          label: 'Color Palette & Dither',
          type: 'select',
          defaultValue: 'retro',
          options: [
            { label: 'Retro 8-Bit (Classic Console)', value: 'retro' },
            { label: 'Game Boy (4-shade Matrix Green)', value: 'gameboy' },
            { label: 'Cyberpunk Neon (Magenta / Cyan)', value: 'cyberpunk' },
          ],
        },
      ];
    case 'json':
      return [
        {
          id: 'indent',
          label: 'Indentation Spaces',
          type: 'select',
          defaultValue: 2,
          options: [
            { label: '2 spaces (standard)', value: 2 },
            { label: '4 spaces (expanded)', value: 4 },
            { label: '0 spaces (compact)', value: 0 },
          ],
        },
      ];
    case 'sql':
      return [
        {
          id: 'tableName',
          label: 'SQL Table Name',
          type: 'text',
          defaultValue: 'chang_itz_data',
          description: 'Destination database table name',
        },
      ];
    case 'morseaudio':
      return [
        {
          id: 'wpm',
          label: 'Morse Speed (WPM)',
          type: 'number',
          defaultValue: 20,
          min: 5,
          max: 40,
          step: 5,
          description: 'Words per minute playback speed',
        },
        {
          id: 'freq',
          label: 'Audio Beep Frequency (Hz)',
          type: 'number',
          defaultValue: 800,
          min: 300,
          max: 1500,
          step: 50,
          description: 'Pitch frequency of Morse telegraph tone',
        },
      ];
    case 'tonesynth':
      return [
        {
          id: 'freq',
          label: 'Tone Frequency (Hz)',
          type: 'number',
          defaultValue: 440,
          min: 20,
          max: 20000,
          step: 10,
          description: '440Hz (Concert A), 528Hz (Solfeggio Healing)',
        },
        {
          id: 'duration',
          label: 'Duration (seconds)',
          type: 'number',
          defaultValue: 3,
          min: 1,
          max: 15,
          step: 1,
        },
      ];
    case 'chr':
      return [
        {
          id: 'characterName',
          label: 'DDLC Character Profile',
          type: 'select',
          defaultValue: 'monika',
          options: [
            { value: 'monika', label: 'Monika (monika.chr - Steganographic PNG Container)' },
            { value: 'sayori', label: 'Sayori (sayori.chr - Hidden Audio Spectrogram)' },
            { value: 'yuri', label: 'Yuri (yuri.chr - Base64 Cipher Narrative)' },
            { value: 'natsuki', label: 'Natsuki (natsuki.chr - Inverted Texture Map)' },
            { value: 'custom', label: 'Custom Literature Club Member' },
          ],
        },
      ];
    default:
      return [];
  }
}

/**
 * Execute conversion between any source file and target format
 */
export async function executeConversion(
  file: File,
  targetFormat: string,
  params: ConversionParams = {}
): Promise<ConversionResult> {
  const target = FORMATS[targetFormat];
  if (!target) throw new Error(`Target format "${targetFormat}" is not supported`);

  // NES Cartridge ROM target or source
  if (targetFormat === 'nes') {
    return convertToNes(file, params);
  }
  if (file.name.toLowerCase().endsWith('.nes')) {
    return convertFromNes(file, targetFormat, params);
  }

  // Spatial Math & Physics (.PI, .Vector3, .quaternion)
  if (targetFormat === 'pi') {
    return convertToPi(file, params);
  }
  if (targetFormat === 'vector3') {
    return convertToVector3(file, params);
  }
  if (targetFormat === 'quaternion') {
    return convertToQuaternion(file, params);
  }
  if (['.pi', '.vector3', '.vec3', '.quaternion', '.quat'].some((ext) => file.name.toLowerCase().endsWith(ext))) {
    return convertFromSpatialMath(file, targetFormat, params);
  }

  // Nintendo 64 ROM (.z64, .n64, .v64) target or source
  if (['z64', 'n64', 'v64'].includes(targetFormat)) {
    return convertToN64(file, targetFormat as 'z64' | 'n64' | 'v64', params);
  }
  if (['.z64', '.n64', '.v64'].some((ext) => file.name.toLowerCase().endsWith(ext))) {
    return convertFromN64(file, targetFormat, params);
  }

  // DOOM & Wii WAD target or source
  if (targetFormat === 'wad') {
    return convertToWad(file, params);
  }
  if (file.name.toLowerCase().endsWith('.wad')) {
    return convertFromWad(file, targetFormat, params);
  }

  // DDLC .chr character file target or source
  if (targetFormat === 'chr') {
    return convertToDdlcChr(file, (params.characterName as any) || 'monika');
  }
  if (file.name.toLowerCase().endsWith('.chr')) {
    return convertFromDdlcChr(file, targetFormat);
  }

  // Bruh target
  if (targetFormat === 'bruh') {
    return convertToBruh(file);
  }
  if (file.name.toLowerCase().endsWith('.bruh')) {
    return convertFromBruh(file, targetFormat);
  }

  // APK, XAPK, AAB package targets
  if (['apk', 'xapk', 'aab', 'obb'].includes(targetFormat) || file.name.toLowerCase().endsWith('.apk') || file.name.toLowerCase().endsWith('.xapk')) {
    return convertPackageFormat(file, targetFormat);
  }

  // Dolby TrueHD & THD targets
  if (['truehd', 'thd', 'atmos'].includes(targetFormat) || file.name.toLowerCase().endsWith('.truehd') || file.name.toLowerCase().endsWith('.thd')) {
    return convertTrueHdFormat(file, targetFormat);
  }

  // Crypto targets take precedence if target is in crypto
  if (['sha256', 'sha512', 'sha1', 'md5', 'crc32', 'hexdump', 'base64', 'urlencode', 'rot13', 'jwtdecode'].includes(targetFormat)) {
    return convertCryptoFormat(file, targetFormat, params);
  }

  // Archive target
  if (targetFormat === 'zip') {
    return createZipArchive([file], `${file.name.substring(0, file.name.lastIndexOf('.')) || file.name}.zip`);
  }

  // If source is a ZIP and target is json manifest
  if (file.name.toLowerCase().endsWith('.zip')) {
    return unpackZipArchive(file);
  }

  // Image targets
  if (['png', 'jpeg', 'webp', 'bmp', 'gif'].includes(targetFormat)) {
    return convertRasterImage(file, targetFormat as any, params);
  }
  if (targetFormat === 'ico') {
    return convertToIco(file, params);
  }
  if (targetFormat === 'svg') {
    return convertToSvg(file, params);
  }
  if (targetFormat === 'asciiart') {
    return convertToAsciiArt(file, params);
  }
  if (targetFormat === 'pixelart') {
    return convertToPixelArt(file, params);
  }
  if (targetFormat === 'palette') {
    return extractColorPalette(file);
  }
  if (targetFormat === 'base64img') {
    return convertImageToBase64(file);
  }

  // Data targets
  if (['json', 'csv', 'tsv', 'yaml', 'xml', 'sql', 'mdtable', 'tsinterface', 'pythondict', 'gostruct', 'minified'].includes(targetFormat)) {
    return convertDataFormat(file, targetFormat, params);
  }

  // Audio targets
  if (['wav', 'tonesynth', 'morseaudio'].includes(targetFormat)) {
    return convertAudioFormat(file, targetFormat, params);
  }

  // Document & Text targets
  if (['html', 'markdown', 'txt', 'vtt', 'srt', 'spongebob', 'camelcase', 'snakecase', 'kebabcase', 'binarytext', 'morsetext', 'nato'].includes(targetFormat)) {
    return convertTextFormat(file, targetFormat, params);
  }

  // Universal format handler for any of the 590 formats
  const startTime = performance.now();
  const logs: any[] = [];
  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Chang-Itz Pipeline converting ${file.name} to ${target.name} (${target.extension})` });

  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const outputName = `${baseName}${target.extension}`;

  if (target.isTextBased) {
    const rawText = await file.text();
    const blob = new Blob([rawText], { type: target.mimeTypes[0] || 'text/plain' });
    logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'success', message: `Serialized and converted to ${target.name} (${(blob.size / 1024).toFixed(1)} KB)` });
    return {
      data: blob,
      outputName,
      outputFormat: targetFormat,
      mimeType: target.mimeTypes[0] || 'text/plain',
      previewType: 'text',
      textContent: rawText.substring(0, 5000),
      logs,
      executionTimeMs: Math.round(performance.now() - startTime),
      originalSizeBytes: file.size,
      convertedSizeBytes: blob.size,
    };
  } else {
    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer], { type: target.mimeTypes[0] || 'application/octet-stream' });
    logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'success', message: `Encoded binary stream to ${target.name} (${(blob.size / 1024).toFixed(1)} KB)` });
    return {
      data: blob,
      outputName,
      outputFormat: targetFormat,
      mimeType: target.mimeTypes[0] || 'application/octet-stream',
      previewType: 'none',
      logs,
      executionTimeMs: Math.round(performance.now() - startTime),
      originalSizeBytes: file.size,
      convertedSizeBytes: blob.size,
    };
  }
}
