import { ConversionParams, ConversionResult, LogEntry } from '../../types/conversion';

/**
 * Basic Markdown to HTML converter
 */
export function markdownToHtml(md: string): string {
  let html = md
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Blockquote
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Bold / Italic
    .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Code blocks & inline code
    .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    // Links & images
    .replace(/!\[([^\]]*)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />')
    .replace(/\[([^\]]+)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
    // Unordered lists
    .replace(/^\s*\*\s+(.*$)/gim, '<ul><li>$1</li></ul>')
    .replace(/^\s*\-\s+(.*$)/gim, '<ul><li>$1</li></ul>')
    .replace(/<\/ul>\s*<ul>/gim, '')
    // Line breaks
    .replace(/\n\n+/gim, '<br><br>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Converted Markdown</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #24292e; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
    code { font-family: "SFMono-Regular", Consolas, monospace; background: rgba(27,31,35,0.05); padding: 0.2em 0.4em; border-radius: 3px; }
    blockquote { border-left: 4px solid #dfe2e5; margin: 0; padding-left: 16px; color: #6a737d; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #dfe2e5; padding: 8px 12px; }
    th { background: #f6f8fa; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
}

/**
 * Basic HTML to Markdown converter
 */
export function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n')
    .replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img\s+(?:[^>]*?\s+)?src="([^"]*)"(?:\s+alt="([^"]*)")?[^>]*>/gi, '![$2]($1)')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<\/ul>|<\/ol>/gi, '\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '') // strip remaining tags
    .trim();
}

/**
 * SRT ↔ VTT Subtitle conversions
 */
export function srtToVtt(srtText: string): string {
  const vtt = srtText
    .replace(/\r\n/g, '\n')
    // Replace 00:00:00,000 with 00:00:00.000
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
  return `WEBVTT\n\n${vtt}`;
}

export function vttToSrt(vttText: string): string {
  return vttText
    .replace(/^WEBVTT[^\n]*\n+/i, '')
    // Replace 00:00:00.000 with 00:00:00,000
    .replace(/(\d{2}:\d{2}:\d{2})\.(\d{3})/g, '$1,$2');
}

/**
 * Case Converters
 */
export function toSpongebob(text: string): string {
  let upper = false;
  return text
    .split('')
    .map((char) => {
      if (/[a-zA-Z]/.test(char)) {
        upper = !upper;
        return upper ? char.toUpperCase() : char.toLowerCase();
      }
      return char;
    })
    .join('');
}

export function toCamelCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

export function toSnakeCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .toLowerCase()
    .replace(/^_+|_+$/g, '');
}

export function toKebabCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');
}

export function toBinaryText(text: string): string {
  return text
    .split('')
    .map((c) => c.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(' ');
}

export function fromBinaryText(binary: string): string {
  return binary
    .trim()
    .split(/\s+/)
    .map((b) => String.fromCharCode(parseInt(b, 2)))
    .join('');
}

export const MORSE_DICT: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.',
  G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
  M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', '0': '-----', ' ': '/',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--'
};

export function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split('')
    .map((ch) => MORSE_DICT[ch] || '')
    .filter(Boolean)
    .join(' ');
}

export const NATO_DICT: Record<string, string> = {
  A: 'Alpha', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo',
  F: 'Foxtrot', G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliett',
  K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', O: 'Oscar',
  P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango',
  U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee', Z: 'Zulu',
  '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
  '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Niner'
};

export function textToNato(text: string): string {
  return text
    .toUpperCase()
    .split('')
    .map((ch) => NATO_DICT[ch] || ch)
    .join(' ');
}

/**
 * Text conversions dispatcher
 */
export async function convertTextFormat(
  file: File,
  targetFormat: string,
  params: ConversionParams = {}
): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Reading text from ${file.name}` });

  const rawText = await file.text();
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

  let outputText = '';
  let outputExt = '.txt';
  let mimeType = 'text/plain';

  switch (targetFormat) {
    case 'html':
      outputText = markdownToHtml(rawText);
      outputExt = '.html';
      mimeType = 'text/html';
      break;
    case 'markdown':
      outputText = htmlToMarkdown(rawText);
      outputExt = '.md';
      mimeType = 'text/markdown';
      break;
    case 'vtt':
      outputText = srtToVtt(rawText);
      outputExt = '.vtt';
      mimeType = 'text/vtt';
      break;
    case 'srt':
      outputText = vttToSrt(rawText);
      outputExt = '.srt';
      mimeType = 'text/plain';
      break;
    case 'spongebob':
      outputText = toSpongebob(rawText);
      outputExt = '.txt';
      break;
    case 'camelcase':
      outputText = toCamelCase(rawText);
      outputExt = '.txt';
      break;
    case 'snakecase':
      outputText = toSnakeCase(rawText);
      outputExt = '.txt';
      break;
    case 'kebabcase':
      outputText = toKebabCase(rawText);
      outputExt = '.txt';
      break;
    case 'binarytext':
      outputText = toBinaryText(rawText);
      outputExt = '.txt';
      break;
    case 'morsetext':
      outputText = textToMorse(rawText);
      outputExt = '.txt';
      break;
    case 'nato':
      outputText = textToNato(rawText);
      outputExt = '.txt';
      break;
    default:
      outputText = rawText;
      outputExt = '.txt';
  }

  const blob = new Blob([outputText], { type: `${mimeType};charset=utf-8` });
  const outputName = `${baseName}${outputExt}`;

  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'success', message: `Processed ${rawText.length} characters into ${outputName}` });

  return {
    data: blob,
    outputName,
    outputFormat: targetFormat,
    mimeType,
    previewType: targetFormat === 'html' ? 'text' : 'text',
    textContent: outputText,
    logs,
    executionTimeMs: Math.round(performance.now() - startTime),
    originalSizeBytes: file.size,
    convertedSizeBytes: blob.size,
  };
}
