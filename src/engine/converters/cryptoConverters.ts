import { ConversionParams, ConversionResult, LogEntry } from '../../types/conversion';

/**
 * Native Web Crypto hash generator
 */
export async function computeSubtleHash(data: ArrayBuffer, algorithm: 'SHA-1' | 'SHA-256' | 'SHA-512'): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Pure JS MD5 implementation (RFC 1321)
 */
export function computeMD5(bytes: Uint8Array): string {
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRol(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(bitRol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  const n = bytes.length;
  const words: number[] = [];
  for (let i = 0; i < n; i++) {
    words[i >> 2] |= bytes[i] << ((i % 4) * 8);
  }
  words[n >> 2] |= 0x80 << ((n % 4) * 8);
  words[(((n + 8) >> 6) << 4) + 14] = n * 8;

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < words.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = md5ff(a, b, c, d, words[i] || 0, 7, -680876936);
    d = md5ff(d, a, b, c, words[i + 1] || 0, 12, -389564586);
    c = md5ff(c, d, a, b, words[i + 2] || 0, 17, 606105819);
    b = md5ff(b, c, d, a, words[i + 3] || 0, 22, -1044525330);
    a = md5ff(a, b, c, d, words[i + 4] || 0, 7, -176418897);
    d = md5ff(d, a, b, c, words[i + 5] || 0, 12, 1200080426);
    c = md5ff(c, d, a, b, words[i + 6] || 0, 17, -1473231341);
    b = md5ff(b, c, d, a, words[i + 7] || 0, 22, -45705983);
    a = md5ff(a, b, c, d, words[i + 8] || 0, 7, 1770035416);
    d = md5ff(d, a, b, c, words[i + 9] || 0, 12, -1958414417);
    c = md5ff(c, d, a, b, words[i + 10] || 0, 17, -42063);
    b = md5ff(b, c, d, a, words[i + 11] || 0, 22, -1990404162);
    a = md5ff(a, b, c, d, words[i + 12] || 0, 7, 1804603682);
    d = md5ff(d, a, b, c, words[i + 13] || 0, 12, -40341101);
    c = md5ff(c, d, a, b, words[i + 14] || 0, 17, -1502002290);
    b = md5ff(b, c, d, a, words[i + 15] || 0, 22, 1236535329);

    a = md5gg(a, b, c, d, words[i + 1] || 0, 5, -165796510);
    d = md5gg(d, a, b, c, words[i + 6] || 0, 9, -1069501632);
    c = md5gg(c, d, a, b, words[i + 11] || 0, 14, 643717713);
    b = md5gg(b, c, d, a, words[i] || 0, 20, -373897302);
    a = md5gg(a, b, c, d, words[i + 5] || 0, 5, -701558691);
    d = md5gg(d, a, b, c, words[i + 10] || 0, 9, 38016083);
    c = md5gg(c, d, a, b, words[i + 15] || 0, 14, -660478335);
    b = md5gg(b, c, d, a, words[i + 4] || 0, 20, -405537848);
    a = md5gg(a, b, c, d, words[i + 9] || 0, 5, 568446438);
    d = md5gg(d, a, b, c, words[i + 14] || 0, 9, -1019803690);
    c = md5gg(c, d, a, b, words[i + 3] || 0, 14, -187363961);
    b = md5gg(b, c, d, a, words[i + 8] || 0, 20, 1163531501);
    a = md5gg(a, b, c, d, words[i + 13] || 0, 5, -1444681467);
    d = md5gg(d, a, b, c, words[i + 2] || 0, 9, -51403784);
    c = md5gg(c, d, a, b, words[i + 7] || 0, 14, 1735328473);
    b = md5gg(b, c, d, a, words[i + 12] || 0, 20, -1926607734);

    a = md5hh(a, b, c, d, words[i + 5] || 0, 4, -378558);
    d = md5hh(d, a, b, c, words[i + 8] || 0, 11, -2022574463);
    c = md5hh(c, d, a, b, words[i + 11] || 0, 16, 1839030562);
    b = md5hh(b, c, d, a, words[i + 14] || 0, 23, -35309556);
    a = md5hh(a, b, c, d, words[i + 1] || 0, 4, -1530992060);
    d = md5hh(d, a, b, c, words[i + 4] || 0, 11, 1272893353);
    c = md5hh(c, d, a, b, words[i + 7] || 0, 16, -155497632);
    b = md5hh(b, c, d, a, words[i + 10] || 0, 23, -1094730640);
    a = md5hh(a, b, c, d, words[i + 13] || 0, 4, 681279174);
    d = md5hh(d, a, b, c, words[i] || 0, 11, -358537222);
    c = md5hh(c, d, a, b, words[i + 3] || 0, 16, -722521979);
    b = md5hh(b, c, d, a, words[i + 6] || 0, 23, 76029189);
    a = md5hh(a, b, c, d, words[i + 9] || 0, 4, -640364487);
    d = md5hh(d, a, b, c, words[i + 12] || 0, 11, -421815835);
    c = md5hh(c, d, a, b, words[i + 15] || 0, 16, 530742520);
    b = md5hh(b, c, d, a, words[i + 2] || 0, 23, -995338651);

    a = md5ii(a, b, c, d, words[i] || 0, 6, -198630844);
    d = md5ii(d, a, b, c, words[i + 7] || 0, 10, 1126891415);
    c = md5ii(c, d, a, b, words[i + 14] || 0, 15, -1416354905);
    b = md5ii(b, c, d, a, words[i + 5] || 0, 21, -57434055);
    a = md5ii(a, b, c, d, words[i + 12] || 0, 6, 1700485571);
    d = md5ii(d, a, b, c, words[i + 3] || 0, 10, -1894986606);
    c = md5ii(c, d, a, b, words[i + 10] || 0, 15, -1051523);
    b = md5ii(b, c, d, a, words[i + 1] || 0, 21, -2054922799);
    a = md5ii(a, b, c, d, words[i + 8] || 0, 6, 1873313359);
    d = md5ii(d, a, b, c, words[i + 15] || 0, 10, -30611744);
    c = md5ii(c, d, a, b, words[i + 6] || 0, 15, -1560198380);
    b = md5ii(b, c, d, a, words[i + 13] || 0, 21, 1309151649);
    a = md5ii(a, b, c, d, words[i + 4] || 0, 6, -145523070);
    d = md5ii(d, a, b, c, words[i + 11] || 0, 10, -1120210379);
    c = md5ii(c, d, a, b, words[i + 2] || 0, 15, 718787259);
    b = md5ii(b, c, d, a, words[i + 9] || 0, 21, -343485551);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  const hexTab = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < 4; i++) {
    const val = [a, b, c, d][i];
    for (let j = 0; j < 4; j++) {
      out += hexTab.charAt((val >> (j * 8 + 4)) & 0x0f) + hexTab.charAt((val >> (j * 8)) & 0x0f);
    }
  }
  return out;
}

/**
 * CRC-32 IEEE 802.3 Checksum
 */
export function computeCRC32(bytes: Uint8Array): string {
  const table: number[] = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }

  let crc = 0 ^ -1;
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ bytes[i]) & 0xff];
  }
  crc = (crc ^ -1) >>> 0;
  return crc.toString(16).padStart(8, '0').toUpperCase();
}

/**
 * Hex dump generator (similar to xxd / hexdump -C)
 */
export function generateHexDump(bytes: Uint8Array): string {
  const lines: string[] = [];
  const len = bytes.length;
  for (let i = 0; i < len; i += 16) {
    const offset = i.toString(16).padStart(8, '0');
    const chunk = bytes.slice(i, i + 16);
    const hexParts: string[] = [];
    let asciiPart = '';

    for (let j = 0; j < 16; j++) {
      if (j < chunk.length) {
        const b = chunk[j];
        hexParts.push(b.toString(16).padStart(2, '0'));
        asciiPart += b >= 32 && b <= 126 ? String.fromCharCode(b) : '.';
      } else {
        hexParts.push('  ');
      }
    }

    const firstHalf = hexParts.slice(0, 8).join(' ');
    const secondHalf = hexParts.slice(8, 16).join(' ');
    lines.push(`${offset}  ${firstHalf}  ${secondHalf}  |${asciiPart}|`);
  }
  return lines.join('\n');
}

/**
 * ROT13 Caesar cipher
 */
export function applyRot13(text: string): string {
  return text.replace(/[a-zA-Z]/g, (c) => {
    const code = c.charCodeAt(0);
    const base = code >= 65 && code <= 90 ? 65 : 97;
    return String.fromCharCode(((code - base + 13) % 26) + base);
  });
}

/**
 * JWT Token Decoder
 */
export function decodeJwt(token: string): string {
  try {
    const parts = token.trim().split('.');
    if (parts.length < 2) throw new Error('Invalid JWT format (expected header.payload.signature)');
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));

    const result = {
      header,
      payload,
      issuedAt: payload.iat ? new Date(payload.iat * 1000).toLocaleString() : undefined,
      expiresAt: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : undefined,
      signature: parts[2] ? `${parts[2].substring(0, 16)}...` : 'none',
    };
    return JSON.stringify(result, null, 2);
  } catch (err: any) {
    return JSON.stringify({ error: 'Failed to decode JWT', message: err.message }, null, 2);
  }
}

/**
 * Main Crypto & Hashes Dispatcher
 */
export async function convertCryptoFormat(
  file: File,
  targetFormat: string,
  params: ConversionParams = {}
): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Calculating cryptographic transform: ${targetFormat.toUpperCase()}` });

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

  let outputText = '';
  let outputExt = '.txt';

  switch (targetFormat) {
    case 'sha256':
      outputText = await computeSubtleHash(buffer, 'SHA-256');
      outputExt = '.sha256.txt';
      break;
    case 'sha512':
      outputText = await computeSubtleHash(buffer, 'SHA-512');
      outputExt = '.sha512.txt';
      break;
    case 'sha1':
      outputText = await computeSubtleHash(buffer, 'SHA-1');
      outputExt = '.sha1.txt';
      break;
    case 'md5':
      outputText = computeMD5(bytes);
      outputExt = '.md5.txt';
      break;
    case 'crc32':
      outputText = computeCRC32(bytes);
      outputExt = '.crc32.txt';
      break;
    case 'hexdump':
      outputText = generateHexDump(bytes);
      outputExt = '.hex.txt';
      break;
    case 'base64': {
      let binary = '';
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      outputText = btoa(binary);
      outputExt = '.b64.txt';
      break;
    }
    case 'urlencode': {
      const text = new TextDecoder().decode(bytes);
      outputText = encodeURIComponent(text);
      outputExt = '.url.txt';
      break;
    }
    case 'rot13': {
      const text = new TextDecoder().decode(bytes);
      outputText = applyRot13(text);
      outputExt = '.rot13.txt';
      break;
    }
    case 'jwtdecode': {
      const text = new TextDecoder().decode(bytes);
      outputText = decodeJwt(text);
      outputExt = '.jwt.json';
      break;
    }
    default:
      outputText = await computeSubtleHash(buffer, 'SHA-256');
  }

  const outputName = `${baseName}${outputExt}`;
  const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });

  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'success', message: `Digest / Output generated: ${outputName}` });

  return {
    data: blob,
    outputName,
    outputFormat: targetFormat,
    mimeType: 'text/plain',
    previewType: 'text',
    textContent: outputText,
    logs,
    executionTimeMs: Math.round(performance.now() - startTime),
    originalSizeBytes: file.size,
    convertedSizeBytes: blob.size,
  };
}
