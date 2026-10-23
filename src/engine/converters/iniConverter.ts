/**
 * Universal INI (Initialization Configuration) Converter & Parser
 * Converts any file (JSON, YAML, CSV, ENV, TOML, XML, Plain Text) to .ini
 * and converts .ini to JSON, YAML, ENV, CSV, and other formats.
 */

import { ConversionResult, ConversionParams, LogEntry } from '../../types/conversion';

export interface IniParsedData {
  [section: string]: Record<string, any>;
}

/**
 * Robust INI Parser supporting sections [Section], comments (# and ;),
 * key=value and key:value delimiters, inline comments, booleans, and numbers.
 */
export function parseIni(text: string): IniParsedData {
  const result: IniParsedData = {};
  let currentSection = 'General';

  const lines = text.split(/\r?\n/);

  for (let line of lines) {
    line = line.trim();

    // Skip empty lines or pure comment lines
    if (!line || line.startsWith(';') || line.startsWith('#')) {
      continue;
    }

    // Check for Section Header: [SectionName]
    const sectionMatch = line.match(/^\[\s*([^\]]+?)\s*\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      if (!result[currentSection]) {
        result[currentSection] = {};
      }
      continue;
    }

    // Key-Value pair: key = value OR key : value
    const kvMatch = line.match(/^([^=:]+?)\s*[=:]\s*(.*)$/);
    if (kvMatch) {
      const rawKey = kvMatch[1].trim();
      let rawVal = kvMatch[2].trim();

      // Strip inline comments if not quoted
      if (!rawVal.startsWith('"') && !rawVal.startsWith("'")) {
        const commentIdx1 = rawVal.indexOf(';');
        const commentIdx2 = rawVal.indexOf('#');
        let commentIdx = -1;
        if (commentIdx1 !== -1 && commentIdx2 !== -1) commentIdx = Math.min(commentIdx1, commentIdx2);
        else if (commentIdx1 !== -1) commentIdx = commentIdx1;
        else if (commentIdx2 !== -1) commentIdx = commentIdx2;

        if (commentIdx !== -1) {
          rawVal = rawVal.slice(0, commentIdx).trim();
        }
      }

      // Strip outer quotes if paired
      if (
        (rawVal.startsWith('"') && rawVal.endsWith('"')) ||
        (rawVal.startsWith("'") && rawVal.endsWith("'"))
      ) {
        rawVal = rawVal.slice(1, -1);
      }

      // Cast types
      let parsedVal: any = rawVal;
      if (/^-?\d+(\.\d+)?$/.test(rawVal)) {
        parsedVal = Number(rawVal);
      } else if (/^(true|yes|on)$/i.test(rawVal)) {
        parsedVal = true;
      } else if (/^(false|no|off)$/i.test(rawVal)) {
        parsedVal = false;
      } else if (/^(null|none)$/i.test(rawVal)) {
        parsedVal = null;
      }

      if (!result[currentSection]) {
        result[currentSection] = {};
      }
      result[currentSection][rawKey] = parsedVal;
    }
  }

  return result;
}

/**
 * Format any structured JavaScript object or array into a standard .ini string
 */
export function formatToIni(
  data: any,
  options: {
    defaultSection?: string;
    delimiter?: '=' | ':';
    commentChar?: '#' | ';';
    addTimestampHeader?: boolean;
  } = {}
): string {
  const delimiter = options.delimiter || '=';
  const commentChar = options.commentChar || ';';
  const defaultSection = options.defaultSection || 'General';

  const outputLines: string[] = [];

  if (options.addTimestampHeader !== false) {
    outputLines.push(`${commentChar} ================================================================`);
    outputLines.push(`${commentChar} Chang-Itz Universal Engine — Generated INI Configuration`);
    outputLines.push(`${commentChar} Created at: ${new Date().toISOString()}`);
    outputLines.push(`${commentChar} ================================================================`);
    outputLines.push('');
  }

  // Case 1: Simple flat object or primitive values
  if (!data || typeof data !== 'object') {
    outputLines.push(`[${defaultSection}]`);
    outputLines.push(`value ${delimiter} ${String(data)}`);
    return outputLines.join('\n');
  }

  // Case 2: Array of items (e.g. CSV or JSON list of records)
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const sectionName = item.name || item.id || item.title || `Item_${index + 1}`;
      outputLines.push(`[${String(sectionName).replace(/[\[\]]/g, '_')}]`);

      if (typeof item === 'object' && item !== null) {
        Object.entries(item).forEach(([k, v]) => {
          outputLines.push(`  ${k} ${delimiter} ${formatValue(v)}`);
        });
      } else {
        outputLines.push(`  value ${delimiter} ${formatValue(item)}`);
      }
      outputLines.push('');
    });
    return outputLines.join('\n');
  }

  // Case 3: Nested object where keys may be sections or top-level properties
  const rootKeys: [string, any][] = [];
  const sectionEntries: [string, any][] = [];

  Object.entries(data).forEach(([key, val]) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      sectionEntries.push([key, val]);
    } else {
      rootKeys.push([key, val]);
    }
  });

  // Write top-level keys in default section if present
  if (rootKeys.length > 0) {
    outputLines.push(`[${defaultSection}]`);
    rootKeys.forEach(([k, v]) => {
      outputLines.push(`  ${k} ${delimiter} ${formatValue(v)}`);
    });
    outputLines.push('');
  }

  // Write each section
  sectionEntries.forEach(([sectionName, sectionObj]) => {
    outputLines.push(`[${sectionName.replace(/[\[\]]/g, '_')}]`);
    Object.entries(sectionObj).forEach(([k, v]) => {
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        // Flatten nested sub-objects with dot notation: sub.key = value
        Object.entries(v).forEach(([subK, subV]) => {
          outputLines.push(`  ${k}.${subK} ${delimiter} ${formatValue(subV)}`);
        });
      } else {
        outputLines.push(`  ${k} ${delimiter} ${formatValue(v)}`);
      }
    });
    outputLines.push('');
  });

  return outputLines.join('\n').trim() + '\n';
}

function formatValue(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val)) return val.map((item) => String(item)).join(', ');
  const str = String(val);
  // Quote if contains special characters or whitespace
  if (str.includes(';') || str.includes('#') || str.includes('=') || str.includes(':') || str.includes('\n')) {
    return `"${str.replace(/"/g, '\\"')}"`;
  }
  return str;
}

/**
 * Convert any file into a clean .ini configuration file
 */
export async function convertToIni(
  file: File,
  params: ConversionParams = {}
): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const fileNameLower = file.name.toLowerCase();

  logs.push({
    timestamp: new Date().toLocaleTimeString(),
    level: 'info',
    message: `Analyzing "${file.name}" for conversion to INI configuration format...`,
  });

  const defaultSection = (params.sectionName as string) || (params.defaultSection as string) || 'Settings';
  const delimiter = (params.delimiter as '=' | ':') || '=';
  const commentChar = (params.commentChar as '#' | ';') || ';';

  let iniText = '';

  // 1. If file is JSON
  if (fileNameLower.endsWith('.json') || file.type.includes('json')) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      logs.push({
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        message: 'Parsed valid JSON data. Constructing INI section headers and key-value tables...',
      });
      iniText = formatToIni(parsed, { defaultSection, delimiter, commentChar });
    } catch (e: any) {
      logs.push({
        timestamp: new Date().toLocaleTimeString(),
        level: 'warn',
        message: `JSON parse warning: ${e.message}. Treating as structured text.`,
      });
    }
  }

  // 2. If file is CSV / TSV
  if (!iniText && (fileNameLower.endsWith('.csv') || fileNameLower.endsWith('.tsv') || file.type.includes('csv'))) {
    try {
      const text = await file.text();
      const isTsv = fileNameLower.endsWith('.tsv') || text.includes('\t');
      const lines = text.trim().split(/\r?\n/);
      if (lines.length > 0) {
        const headers = lines[0].split(isTsv ? '\t' : ',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
        const rows: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(isTsv ? '\t' : ',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
          const rowObj: Record<string, any> = {};
          headers.forEach((h, idx) => {
            rowObj[h || `Field_${idx + 1}`] = vals[idx] ?? '';
          });
          rows.push(rowObj);
        }
        logs.push({
          timestamp: new Date().toLocaleTimeString(),
          level: 'info',
          message: `Parsed ${rows.length} tabular rows. Formatting each row as an INI section...`,
        });
        iniText = formatToIni(rows, { defaultSection, delimiter, commentChar });
      }
    } catch {
      // fallback
    }
  }

  // 3. If file is .env or key-value properties
  if (!iniText && (fileNameLower.endsWith('.env') || fileNameLower.endsWith('.properties') || fileNameLower.endsWith('.conf'))) {
    const text = await file.text();
    const envObj: Record<string, any> = {};
    const lines = text.split(/\r?\n/);
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq !== -1) {
        const k = trimmed.slice(0, eq).trim();
        const v = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
        envObj[k] = v;
      }
    });
    logs.push({
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      message: `Parsed ${Object.keys(envObj).length} key-value environment pairs into [Environment] section...`,
    });
    iniText = formatToIni({ Environment: envObj }, { defaultSection: 'Environment', delimiter, commentChar });
  }

  // 4. If plain text or any other text format
  if (!iniText) {
    try {
      const rawText = await file.text();
      // Check if it already looks like INI
      if (rawText.includes('[') && rawText.includes(']') && (rawText.includes('=') || rawText.includes(':'))) {
        logs.push({
          timestamp: new Date().toLocaleTimeString(),
          level: 'info',
          message: 'Validating and standardizing existing INI format layout...',
        });
        const parsed = parseIni(rawText);
        iniText = formatToIni(parsed, { defaultSection, delimiter, commentChar });
      } else {
        // Line-by-line key/value parsing
        const lines = rawText.split(/\r?\n/);
        const sectionMap: Record<string, any> = {};
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return;
          const match = trimmed.match(/^([^=:]+)\s*[=:]\s*(.*)$/);
          if (match) {
            sectionMap[match[1].trim()] = match[2].trim();
          } else {
            sectionMap[`Line_${idx + 1}`] = trimmed;
          }
        });
        iniText = formatToIni({ [defaultSection]: sectionMap }, { defaultSection, delimiter, commentChar });
      }
    } catch {
      // Binary fallback: create metadata INI
      iniText = formatToIni(
        {
          FileMetadata: {
            Name: file.name,
            SizeBytes: file.size,
            MimeType: file.type || 'application/octet-stream',
            LastModified: new Date(file.lastModified).toISOString(),
            ChangItzStatus: 'Converted to INI manifest representation',
          },
        },
        { defaultSection: 'FileMetadata', delimiter, commentChar }
      );
    }
  }

  const executionTimeMs = Math.round(performance.now() - startTime);
  const convertedSizeBytes = new TextEncoder().encode(iniText).length;

  logs.push({
    timestamp: new Date().toLocaleTimeString(),
    level: 'success',
    message: `Successfully generated ${baseName}.ini (${convertedSizeBytes.toLocaleString()} bytes) in ${executionTimeMs}ms!`,
  });

  return {
    data: iniText,
    outputName: `${baseName}.ini`,
    outputFormat: 'ini',
    mimeType: 'text/plain',
    previewType: 'text',
    textContent: iniText,
    logs,
    executionTimeMs,
    originalSizeBytes: file.size,
    convertedSizeBytes,
  };
}

/**
 * Convert an existing .ini file into JSON, YAML, ENV, CSV, or other formats
 */
export async function convertFromIni(
  file: File,
  targetFormat: string,
  _params: ConversionParams = {}
): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const text = await file.text();

  logs.push({
    timestamp: new Date().toLocaleTimeString(),
    level: 'info',
    message: `Parsing INI configuration file "${file.name}"...`,
  });

  const parsed = parseIni(text);
  const sectionCount = Object.keys(parsed).length;
  logs.push({
    timestamp: new Date().toLocaleTimeString(),
    level: 'info',
    message: `Discovered ${sectionCount} sections in INI file: ${Object.keys(parsed).join(', ')}`,
  });

  let outputData: string | Blob = '';
  let outputFormat = targetFormat;
  let outputExt = targetFormat;
  let mimeType = 'text/plain';
  let previewType: 'text' | 'image' | 'hex' | 'none' = 'text';

  switch (targetFormat) {
    case 'json': {
      outputData = JSON.stringify(parsed, null, 2);
      outputExt = 'json';
      mimeType = 'application/json';
      break;
    }

    case 'yaml':
    case 'yml': {
      const yamlLines: string[] = ['# Generated by Chang-Itz from ' + file.name];
      Object.entries(parsed).forEach(([sec, kvs]) => {
        yamlLines.push(`${sec}:`);
        Object.entries(kvs).forEach(([k, v]) => {
          yamlLines.push(`  ${k}: ${typeof v === 'string' && (v.includes(' ') || v.includes(':')) ? `"${v}"` : v}`);
        });
      });
      outputData = yamlLines.join('\n');
      outputExt = 'yaml';
      mimeType = 'text/yaml';
      break;
    }

    case 'env': {
      const envLines: string[] = ['# Environment export from ' + file.name];
      Object.entries(parsed).forEach(([sec, kvs]) => {
        envLines.push(`\n# --- [${sec}] ---`);
        Object.entries(kvs).forEach(([k, v]) => {
          // Format as UPPERCASE_SECTION_KEY or KEY
          const envKey = `${sec.toUpperCase().replace(/[^A-Z0-9_]/g, '_')}_${k.toUpperCase().replace(/[^A-Z0-9_]/g, '_')}`;
          envLines.push(`${envKey}="${String(v).replace(/"/g, '\\"')}"`);
        });
      });
      outputData = envLines.join('\n');
      outputExt = 'env';
      mimeType = 'text/plain';
      break;
    }

    case 'csv': {
      const csvLines: string[] = ['Section,Key,Value'];
      Object.entries(parsed).forEach(([sec, kvs]) => {
        Object.entries(kvs).forEach(([k, v]) => {
          csvLines.push(`"${sec}","${k}","${String(v).replace(/"/g, '""')}"`);
        });
      });
      outputData = csvLines.join('\n');
      outputExt = 'csv';
      mimeType = 'text/csv';
      break;
    }

    case 'toml': {
      const tomlLines: string[] = ['# TOML configuration generated by Chang-Itz'];
      Object.entries(parsed).forEach(([sec, kvs]) => {
        tomlLines.push(`\n[${sec}]`);
        Object.entries(kvs).forEach(([k, v]) => {
          if (typeof v === 'boolean') tomlLines.push(`${k} = ${v}`);
          else if (typeof v === 'number') tomlLines.push(`${k} = ${v}`);
          else tomlLines.push(`${k} = "${String(v).replace(/"/g, '\\"')}"`);
        });
      });
      outputData = tomlLines.join('\n');
      outputExt = 'toml';
      mimeType = 'text/plain';
      break;
    }

    default: {
      // Fallback: formatted report
      outputData = JSON.stringify(parsed, null, 2);
      outputExt = 'json';
      mimeType = 'application/json';
      break;
    }
  }

  const executionTimeMs = Math.round(performance.now() - startTime);
  const convertedSizeBytes = typeof outputData === 'string' ? new TextEncoder().encode(outputData).length : (outputData as Blob).size;

  logs.push({
    timestamp: new Date().toLocaleTimeString(),
    level: 'success',
    message: `Transformed INI configuration to ${outputExt.toUpperCase()} successfully!`,
  });

  return {
    data: outputData,
    outputName: `${baseName}.${outputExt}`,
    outputFormat,
    mimeType,
    previewType,
    textContent: typeof outputData === 'string' ? outputData : undefined,
    logs,
    executionTimeMs,
    originalSizeBytes: file.size,
    convertedSizeBytes,
  };
}
