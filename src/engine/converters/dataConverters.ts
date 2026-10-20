import { ConversionParams, ConversionResult, LogEntry } from '../../types/conversion';

/**
 * Robust CSV/TSV parser
 */
export function parseDelimitedText(text: string, delimiter: string = ','): any[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return [];

  // Parse header
  const headers = parseCSVLine(lines[0], delimiter);
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line, delimiter);
    const rowObj: Record<string, any> = {};
    headers.forEach((h, idx) => {
      let val: any = values[idx] ?? '';
      // Try parsing numeric/boolean
      if (/^-?\d+(\.\d+)?$/.test(val)) val = Number(val);
      else if (val.toLowerCase() === 'true') val = true;
      else if (val.toLowerCase() === 'false') val = false;
      rowObj[h] = val;
    });
    rows.push(rowObj);
  }

  return rows;
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Array of objects to CSV or TSV
 */
export function objectsToDelimited(data: any[], delimiter: string = ','): string {
  if (!Array.isArray(data) || data.length === 0) return '';
  const first = data[0];
  const headers = typeof first === 'object' && first !== null ? Object.keys(first) : ['value'];

  const escapeVal = (v: any) => {
    if (v === null || v === undefined) return '';
    const str = typeof v === 'object' ? JSON.stringify(v) : String(v);
    if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerRow = headers.map(escapeVal).join(delimiter);
  const rows = data.map((item) => {
    if (typeof item === 'object' && item !== null) {
      return headers.map((h) => escapeVal(item[h])).join(delimiter);
    }
    return escapeVal(item);
  });

  return [headerRow, ...rows].join('\n');
}

/**
 * Simple JSON to YAML converter
 */
export function jsonToYaml(obj: any, indent: number = 0): string {
  const sp = ' '.repeat(indent);
  if (obj === null || obj === undefined) return 'null\n';
  if (typeof obj === 'boolean' || typeof obj === 'number') return `${obj}\n`;
  if (typeof obj === 'string') {
    if (obj.includes('\n') || obj.includes(':') || obj.includes('#') || obj.trim() !== obj) {
      return `"${obj.replace(/"/g, '\\"')}"\n`;
    }
    return `${obj}\n`;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]\n';
    return obj
      .map((item) => {
        const itemYaml = jsonToYaml(item, indent + 2);
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          const lines = itemYaml.trim().split('\n');
          return `${sp}- ${lines[0]}\n${lines.slice(1).map((l) => `${sp}  ${l}`).join('\n')}${lines.length > 1 ? '\n' : ''}`;
        }
        return `${sp}- ${itemYaml.trim()}\n`;
      })
      .join('');
  }

  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}\n';
    return keys
      .map((key) => {
        const val = obj[key];
        if (typeof val === 'object' && val !== null) {
          return `${sp}${key}:\n${jsonToYaml(val, indent + 2)}`;
        }
        return `${sp}${key}: ${jsonToYaml(val, 0)}`;
      })
      .join('');
  }

  return String(obj) + '\n';
}

/**
 * Simple YAML to JSON converter
 */
export function yamlToJson(yamlText: string): any {
  // Try direct JSON first
  try {
    return JSON.parse(yamlText);
  } catch {
    // Basic line-based YAML parser for key-value and lists
    const lines = yamlText.split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith('#'));
    const root: Record<string, any> = {};

    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        const key = line.substring(0, colonIdx).trim().replace(/^['"]|['"]$/g, '');
        let val: any = line.substring(colonIdx + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        else if (val === 'true') val = true;
        else if (val === 'false') val = false;
        else if (val === 'null') val = null;
        else if (/^-?\d+(\.\d+)?$/.test(val)) val = Number(val);
        root[key] = val;
      }
    }
    return root;
  }
}

/**
 * JSON to XML converter
 */
export function jsonToXml(obj: any, rootTag: string = 'root', indent: number = 0): string {
  const sp = ' '.repeat(indent);
  if (obj === null || obj === undefined) return `${sp}<${rootTag}/>\n`;

  if (Array.isArray(obj)) {
    return obj.map((item) => jsonToXml(item, 'item', indent)).join('');
  }

  if (typeof obj === 'object') {
    let inner = '';
    for (const [key, val] of Object.entries(obj)) {
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '_') || 'field';
      inner += jsonToXml(val, sanitizedKey, indent + 2);
    }
    return `${sp}<${rootTag}>\n${inner}${sp}</${rootTag}>\n`;
  }

  // Primitive
  const escaped = String(obj)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `${sp}<${rootTag}>${escaped}</${rootTag}>\n`;
}

/**
 * JSON to SQL INSERT Statements
 */
export function jsonToSql(data: any, tableName: string = 'chang_itz_records'): string {
  const items = Array.isArray(data) ? data : [data];
  if (items.length === 0) return `-- Empty dataset\n`;

  const columns = Object.keys(items[0]);
  const colDefs = columns.map((col) => `  \`${col}\` VARCHAR(255)`).join(',\n');
  const createTable = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (\n  \`id\` INT AUTO_INCREMENT PRIMARY KEY,\n${colDefs}\n);\n\n`;

  const escapeSql = (v: any) => {
    if (v === null || v === undefined) return 'NULL';
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    return `'${String(v).replace(/'/g, "''")}'`;
  };

  const inserts = items
    .map((row) => {
      const vals = columns.map((col) => escapeSql(row[col])).join(', ');
      return `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${vals});`;
    })
    .join('\n');

  return `-- Generated by Chang-Itz\n${createTable}${inserts}\n`;
}

/**
 * JSON / CSV to Markdown Table
 */
export function jsonToMarkdownTable(data: any): string {
  const items = Array.isArray(data) ? data : [data];
  if (items.length === 0) return '*(No data)*';
  const headers = Object.keys(items[0]);

  const headerLine = `| ${headers.join(' | ')} |`;
  const sepLine = `| ${headers.map(() => '---').join(' | ')} |`;
  const rows = items.map((row) => {
    return `| ${headers.map((h) => String(row[h] ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ')} |`;
  });

  return [headerLine, sepLine, ...rows].join('\n');
}

/**
 * JSON to TypeScript Interface Generator
 */
export function jsonToTypeScript(data: any, interfaceName: string = 'ChangItzData'): string {
  const sample = Array.isArray(data) ? data[0] || {} : data;

  const getType = (val: any): string => {
    if (val === null || val === undefined) return 'unknown';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'any[]';
      return `${getType(val[0])}[]`;
    }
    if (typeof val === 'object') return 'Record<string, any>';
    return typeof val;
  };

  const fields = Object.entries(sample)
    .map(([key, val]) => `  ${key}: ${getType(val)};`)
    .join('\n');

  return `/**
 * Generated by Chang-Itz TypeScript Model Engine
 */
export interface ${interfaceName} {
${fields}
}
`;
}

/**
 * JSON to Python Dict
 */
export function jsonToPython(data: any): string {
  return `# Generated by Chang-Itz Python Data Engine
data = ${JSON.stringify(data, null, 4)
    .replace(/: true/g, ': True')
    .replace(/: false/g, ': False')
    .replace(/: null/g, ': None')}
`;
}

/**
 * JSON to Go Struct
 */
export function jsonToGoStruct(data: any, structName: string = 'AutoGenerated'): string {
  const sample = Array.isArray(data) ? data[0] || {} : data;
  const toPascal = (str: string) => str.replace(/(^\w|_\w)/g, (m) => m.replace('_', '').toUpperCase());

  const getGoType = (val: any): string => {
    if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float64';
    if (typeof val === 'boolean') return 'bool';
    if (typeof val === 'string') return 'string';
    if (Array.isArray(val)) return '[]interface{}';
    return 'map[string]interface{}';
  };

  const fields = Object.entries(sample)
    .map(([key, val]) => `\t${toPascal(key)} ${getGoType(val)} \`json:"${key}"\``)
    .join('\n');

  return `package main

// ${structName} generated by Chang-Itz Go Model Engine
type ${structName} struct {
${fields}
}
`;
}

/**
 * Excel 2003/2007/365 XML Spreadsheet (SpreadSheetML)
 * Natively opens in Microsoft Excel, Google Sheets, and LibreOffice Calc
 */
export function jsonToExcelXml(data: any, sheetName: string = 'Sheet1'): string {
  const items = Array.isArray(data) ? data : [data];
  if (items.length === 0) return '<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"></Workbook>';
  const headers = Object.keys(items[0]);

  const escapeXml = (str: any) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const getCellType = (val: any): string => {
    if (typeof val === 'number') return 'Number';
    return 'String';
  };

  const headerRowXml = `      <Row ss:StyleID="HeaderStyle">\n` +
    headers.map((h) => `        <Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join('\n') +
    `\n      </Row>`;

  const dataRowsXml = items.map((row) => {
    const cells = headers.map((h) => {
      const val = row[h];
      const type = getCellType(val);
      const formattedVal = val === null || val === undefined ? '' : escapeXml(val);
      return `        <Cell><Data ss:Type="${type}">${formattedVal}</Data></Cell>`;
    }).join('\n');
    return `      <Row>\n${cells}\n      </Row>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>Chang-Itz Universal Converter</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0ea5e9"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#0284c7" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${escapeXml(sheetName)}">
  <Table ss:ExpandedColumnCount="${headers.length}" ss:ExpandedRowCount="${items.length + 1}" x:FullColumns="1" x:FullRows="1">
${headerRowXml}
${dataRowsXml}
  </Table>
 </Worksheet>
</Workbook>`;
}

/**
 * SQLite DDL and INSERT generator
 */
export function jsonToSqlite(data: any, tableName: string = 'chang_itz_table'): string {
  const items = Array.isArray(data) ? data : [data];
  if (items.length === 0) return `-- Empty dataset\n`;

  const sample = items[0];
  const columns = Object.keys(sample);

  const getSqliteType = (val: any): string => {
    if (typeof val === 'number') return Number.isInteger(val) ? 'INTEGER' : 'REAL';
    if (typeof val === 'boolean') return 'INTEGER';
    return 'TEXT';
  };

  const colDefs = columns.map((col) => `  "${col}" ${getSqliteType(sample[col])}`).join(',\n');
  const ddl = `-- SQLite Database Dump generated by Chang-Itz\n` +
    `PRAGMA foreign_keys = OFF;\n` +
    `BEGIN TRANSACTION;\n\n` +
    `CREATE TABLE IF NOT EXISTS "${tableName}" (\n` +
    `  "row_id" INTEGER PRIMARY KEY AUTOINCREMENT,\n` +
    `${colDefs}\n` +
    `);\n\n`;

  const escapeSql = (v: any) => {
    if (v === null || v === undefined) return 'NULL';
    if (typeof v === 'boolean') return v ? '1' : '0';
    if (typeof v === 'number') return String(v);
    return `'${String(v).replace(/'/g, "''")}'`;
  };

  const inserts = items.map((row) => {
    const vals = columns.map((c) => escapeSql(row[c])).join(', ');
    return `INSERT INTO "${tableName}" ("${columns.join('", "')}") VALUES (${vals});`;
  }).join('\n');

  return `${ddl}${inserts}\n\nCOMMIT;\n-- Total records: ${items.length}\n`;
}

/**
 * PostgreSQL Schema & INSERT statements with rich data types
 */
export function jsonToPostgres(data: any, tableName: string = 'chang_itz_table'): string {
  const items = Array.isArray(data) ? data : [data];
  if (items.length === 0) return `-- Empty dataset\n`;

  const sample = items[0];
  const columns = Object.keys(sample);

  const getPgType = (val: any): string => {
    if (typeof val === 'number') return Number.isInteger(val) ? 'BIGINT' : 'NUMERIC(14,4)';
    if (typeof val === 'boolean') return 'BOOLEAN';
    if (Array.isArray(val) || (typeof val === 'object' && val !== null)) return 'JSONB';
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) return 'TIMESTAMPTZ';
    return 'TEXT';
  };

  const colDefs = columns.map((col) => `    "${col}" ${getPgType(sample[col])}`).join(',\n');
  const ddl = `-- PostgreSQL Schema and Seed Script generated by Chang-Itz\n` +
    `CREATE TABLE IF NOT EXISTS "${tableName}" (\n` +
    `    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n` +
    `${colDefs},\n` +
    `    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()\n` +
    `);\n\n`;

  const escapePg = (v: any) => {
    if (v === null || v === undefined) return 'NULL';
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    if (typeof v === 'number') return String(v);
    if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
    return `'${String(v).replace(/'/g, "''")}'`;
  };

  const inserts = items.map((row) => {
    const vals = columns.map((c) => escapePg(row[c])).join(', ');
    return `INSERT INTO "${tableName}" ("${columns.join('", "')}") VALUES (${vals});`;
  }).join('\n');

  return `${ddl}${inserts}\n`;
}

/**
 * Newline Delimited JSON (JSONL / NDJSON)
 */
export function jsonToNdjson(data: any): string {
  const items = Array.isArray(data) ? data : [data];
  return items.map((row) => JSON.stringify(row)).join('\n') + '\n';
}

/**
 * MongoDB MongoShell insertMany script
 */
export function jsonToMongoScript(data: any, collectionName: string = 'records'): string {
  const items = Array.isArray(data) ? data : [data];
  return `/**\n * MongoDB Seed Script generated by Chang-Itz\n */\n` +
    `// Switch to your database, e.g.: use chang_itz_db;\n\n` +
    `db.getCollection('${collectionName}').insertMany(${JSON.stringify(items, null, 2)});\n\n` +
    `print('Inserted ' + ${items.length} + ' documents into "${collectionName}".');\n`;
}

/**
 * Styled HTML Spreadsheet Table (viewable in browser or embeddable in reports)
 */
export function jsonToHtmlSpreadsheet(data: any, title: string = 'Spreadsheet'): string {
  const items = Array.isArray(data) ? data : [data];
  if (items.length === 0) return '<p>No data available</p>';
  const headers = Object.keys(items[0]);

  const escapeHtml = (str: any) => {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  const ths = headers.map((h) => `        <th>${escapeHtml(h)}</th>`).join('\n');
  const trs = items.map((row, idx) => {
    const tds = headers.map((h) => {
      const val = row[h];
      const isNum = typeof val === 'number';
      return `        <td class="${isNum ? 'num' : ''}">${escapeHtml(val)}</td>`;
    }).join('\n');
    return `      <tr class="${idx % 2 === 0 ? 'even' : 'odd'}">\n${tds}\n      </tr>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)} - Chang-Itz Spreadsheet</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; margin: 0; }
    h1 { font-size: 1.5rem; margin-bottom: 12px; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
    .badge { font-size: 0.75rem; background: #0369a1; padding: 2px 8px; border-radius: 9999px; }
    .table-container { overflow-x: auto; border: 1px solid #334155; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left; }
    th { background: #1e293b; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 12px 16px; border-bottom: 2px solid #0ea5e9; }
    td { padding: 10px 16px; border-bottom: 1px solid #1e293b; }
    td.num { text-align: right; font-family: monospace; color: #38bdf8; }
    tr.odd { background: rgba(30, 41, 59, 0.4); }
    tr.even { background: rgba(15, 23, 42, 0.7); }
    tr:hover { background: rgba(56, 189, 248, 0.1); }
    .footer { margin-top: 12px; font-size: 0.75rem; color: #64748b; text-align: right; }
  </style>
</head>
<body>
  <h1><span>📊</span> ${escapeHtml(title)} <span class="badge">${items.length} Rows</span></h1>
  <div class="table-container">
    <table>
      <thead>
        <tr>
${ths}
        </tr>
      </thead>
      <tbody>
${trs}
      </tbody>
    </table>
  </div>
  <div class="footer">Exported via Chang-Itz Universal Engine on ${new Date().toLocaleString()}</div>
</body>
</html>`;
}

/**
 * GraphQL Schema & Seed Query generator
 */
export function jsonToGraphql(data: any, typeName: string = 'Record'): string {
  const items = Array.isArray(data) ? data : [data];
  if (items.length === 0) return `# Empty dataset\n`;
  const sample = items[0];

  const getGqlType = (val: any): string => {
    if (typeof val === 'number') return Number.isInteger(val) ? 'Int' : 'Float';
    if (typeof val === 'boolean') return 'Boolean';
    return 'String';
  };

  const fields = Object.entries(sample)
    .map(([key, val]) => `  ${key}: ${getGqlType(val)}`)
    .join('\n');

  return `"""
Generated by Chang-Itz GraphQL Model Engine
"""
type ${typeName} {
  id: ID!
${fields}
}

input ${typeName}Input {
${fields}
}

type Query {
  get${typeName}s: [${typeName}!]!
  get${typeName}(id: ID!): ${typeName}
}

type Mutation {
  create${typeName}(input: ${typeName}Input!): ${typeName}!
  seed${typeName}s(inputs: [${typeName}Input!]!): Int!
}
`;
}

/**
 * Main Data Conversion Dispatcher
 */
export async function convertDataFormat(
  file: File,
  targetFormat: string,
  params: ConversionParams = {}
): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Reading file ${file.name} for data conversion` });

  const rawText = await file.text();
  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Parsed input text (${rawText.length} characters)` });

  let parsedData: any;
  const lowerName = file.name.toLowerCase();

  // Parse input
  if (lowerName.endsWith('.csv')) {
    parsedData = parseDelimitedText(rawText, ',');
  } else if (lowerName.endsWith('.tsv')) {
    parsedData = parseDelimitedText(rawText, '\t');
  } else if (lowerName.endsWith('.yaml') || lowerName.endsWith('.yml')) {
    parsedData = yamlToJson(rawText);
  } else {
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      // Fallback: try parsing as CSV
      parsedData = parseDelimitedText(rawText, ',');
    }
  }

  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  let outputText = '';
  let outputExt = '.txt';
  let mimeType = 'text/plain';

  switch (targetFormat) {
    case 'json':
      outputText = JSON.stringify(parsedData, null, params.indent || 2);
      outputExt = '.json';
      mimeType = 'application/json';
      break;
    case 'csv':
      outputText = objectsToDelimited(Array.isArray(parsedData) ? parsedData : [parsedData], ',');
      outputExt = '.csv';
      mimeType = 'text/csv';
      break;
    case 'tsv':
      outputText = objectsToDelimited(Array.isArray(parsedData) ? parsedData : [parsedData], '\t');
      outputExt = '.tsv';
      mimeType = 'text/tab-separated-values';
      break;
    case 'yaml':
      outputText = jsonToYaml(parsedData);
      outputExt = '.yaml';
      mimeType = 'text/yaml';
      break;
    case 'xml':
      outputText = `<?xml version="1.0" encoding="UTF-8"?>\n${jsonToXml(parsedData)}`;
      outputExt = '.xml';
      mimeType = 'application/xml';
      break;
    case 'sql':
      outputText = jsonToSql(parsedData, params.tableName || 'chang_itz_data');
      outputExt = '.sql';
      mimeType = 'application/sql';
      break;
    case 'mdtable':
      outputText = jsonToMarkdownTable(parsedData);
      outputExt = '.md';
      mimeType = 'text/markdown';
      break;
    case 'tsinterface':
      outputText = jsonToTypeScript(parsedData, params.interfaceName || 'ChangItzData');
      outputExt = '.ts';
      mimeType = 'text/typescript';
      break;
    case 'pythondict':
      outputText = jsonToPython(parsedData);
      outputExt = '.py';
      mimeType = 'text/x-python';
      break;
    case 'gostruct':
      outputText = jsonToGoStruct(parsedData, params.structName || 'ChangItzModel');
      outputExt = '.go';
      mimeType = 'text/plain';
      break;
    case 'excel':
    case 'xls':
    case 'xlsx':
      outputText = jsonToExcelXml(parsedData, baseName);
      outputExt = '.xml';
      mimeType = 'application/vnd.ms-excel';
      break;
    case 'sqlite':
      outputText = jsonToSqlite(parsedData, baseName.replace(/[^a-zA-Z0-9_]/g, '_'));
      outputExt = '.sql';
      mimeType = 'application/sql';
      break;
    case 'postgres':
    case 'postgresql':
      outputText = jsonToPostgres(parsedData, baseName.replace(/[^a-zA-Z0-9_]/g, '_'));
      outputExt = '.sql';
      mimeType = 'application/sql';
      break;
    case 'jsonl':
    case 'ndjson':
      outputText = jsonToNdjson(parsedData);
      outputExt = '.jsonl';
      mimeType = 'application/x-ndjson';
      break;
    case 'mongodb':
    case 'mongo':
      outputText = jsonToMongoScript(parsedData, baseName.replace(/[^a-zA-Z0-9_]/g, '_'));
      outputExt = '.js';
      mimeType = 'application/javascript';
      break;
    case 'html':
    case 'htmltable':
      outputText = jsonToHtmlSpreadsheet(parsedData, baseName);
      outputExt = '.html';
      mimeType = 'text/html';
      break;
    case 'graphql':
    case 'gql':
      outputText = jsonToGraphql(parsedData, 'Record');
      outputExt = '.graphql';
      mimeType = 'text/plain';
      break;
    case 'minified':
      outputText = JSON.stringify(parsedData);
      outputExt = '.min.json';
      mimeType = 'application/json';
      break;
    default:
      outputText = JSON.stringify(parsedData, null, 2);
      outputExt = '.json';
  }

  const blob = new Blob([outputText], { type: `${mimeType};charset=utf-8` });
  const outputName = `${baseName}${outputExt}`;

  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'success', message: `Converted successfully to ${outputName} (${(blob.size / 1024).toFixed(1)} KB)` });

  return {
    data: blob,
    outputName,
    outputFormat: targetFormat,
    mimeType,
    previewType: 'text',
    textContent: outputText,
    logs,
    executionTimeMs: Math.round(performance.now() - startTime),
    originalSizeBytes: file.size,
    convertedSizeBytes: blob.size,
  };
}
