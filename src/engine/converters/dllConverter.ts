import { LogEntry, ConversionParams, ConversionResult } from '../../types/conversion';
import { FORMATS } from '../formats';

function createLog(level: LogEntry['level'], message: string): LogEntry {
  return { timestamp: new Date().toLocaleTimeString(), level, message };
}

function alignUp(value: number, alignment: number): number {
  return Math.ceil(value / alignment) * alignment;
}

function writeAscii(view: Uint8Array, offset: number, str: string, maxLen?: number): number {
  const limit = maxLen !== undefined ? Math.min(str.length, maxLen) : str.length;
  for (let i = 0; i < limit; i++) {
    view[offset + i] = str.charCodeAt(i) & 0x7f;
  }
  return limit;
}

export interface DllBuildOptions {
  arch?: 'x64' | 'x86';
  exportName?: string;
  subsystem?: 'gui' | 'console';
  sourceFileName?: string;
}

export interface ParsedPeInfo {
  isValidPe: boolean;
  isDll: boolean;
  architecture: 'x64 (AMD64)' | 'x86 (i386)' | 'ARM64' | 'Unknown';
  machineCode: number;
  characteristics: number;
  timestamp: string;
  entryPointRva: number;
  imageBase: string;
  subsystem: number;
  sections: Array<{
    name: string;
    virtualSize: number;
    virtualAddress: string;
    rawSize: number;
    rawOffset: number;
    characteristics: string;
  }>;
  embeddedChangItzFileName?: string;
  embeddedPayloadBytes?: Uint8Array;
}

/**
 * Pure helper to construct an authentic Windows PE/COFF Dynamic-Link Library (.dll) binary.
 * Contains a valid DOS MZ header, PE\0\0 signature, COFF header with IMAGE_FILE_DLL (0x2000),
 * PE32/PE32+ Optional Header, Export Directory (.rdata), executable DllMain (.text),
 * and source payload embedded in .data.
 */
export function buildPeDllBytes(payloadBytes: Uint8Array, options: DllBuildOptions = {}): Uint8Array {
  const arch = options.arch === 'x86' ? 'x86' : 'x64';
  const is64 = arch === 'x64';
  const rawSymbol = (options.exportName || 'ChangItzEntry').replace(/[^A-Za-z0-9_]/g, '') || 'ChangItzEntry';
  const baseFileName = (options.sourceFileName || 'module.bin').replace(/[^A-Za-z0-9._-]/g, '_');
  const dllInternalName = `${baseFileName.replace(/\.[^.]+$/, '') || 'changitz'}.dll`.slice(0, 48);

  const fileAlignment = 0x200; // 512 bytes
  const sectionAlignment = 0x1000; // 4096 bytes

  // Build .data payload wrapper: "CHGZ" (4) + nameLen (2) + payloadLen (4) + nameBytes + payloadBytes
  const nameEncoder = new TextEncoder();
  const safeNameBytes = nameEncoder.encode(baseFileName).slice(0, 255);
  const dataHeaderSize = 10 + safeNameBytes.length;
  const rawDataSectionLen = dataHeaderSize + payloadBytes.length;
  const alignedDataRawSize = Math.max(fileAlignment, alignUp(rawDataSectionLen, fileAlignment));
  const alignedDataVirtualSize = alignUp(rawDataSectionLen, sectionAlignment);

  const headersRawSize = 0x400; // 1024 bytes
  const textRawOffset = headersRawSize; // 0x400
  const textRawSize = fileAlignment; // 0x200
  const rdataRawOffset = textRawOffset + textRawSize; // 0x600
  const rdataRawSize = fileAlignment; // 0x200
  const dataRawOffset = rdataRawOffset + rdataRawSize; // 0x800

  const textRva = 0x1000;
  const rdataRva = 0x2000;
  const dataRva = 0x3000;
  const sizeOfImage = dataRva + alignedDataVirtualSize;

  const totalSize = dataRawOffset + alignedDataRawSize;
  const out = new Uint8Array(totalSize);
  const dv = new DataView(out.buffer);

  // 1. DOS MZ Header (64 bytes)
  out[0] = 0x4d; // 'M'
  out[1] = 0x5a; // 'Z'
  dv.setUint16(0x02, 0x0090, true); // Bytes on last page
  dv.setUint16(0x04, 0x0003, true); // Pages in file
  dv.setUint16(0x08, 0x0004, true); // Header size in paragraphs
  dv.setUint16(0x0a, 0x0000, true); // Min extra paragraphs
  dv.setUint16(0x0c, 0xffff, true); // Max extra paragraphs
  dv.setUint16(0x10, 0x00b8, true); // Initial SP
  dv.setUint16(0x18, 0x0040, true); // Relocation table address
  const eLfanew = 0x80;
  dv.setUint32(0x3c, eLfanew, true);

  // DOS 16-bit stub at 0x40
  const dosCode = [
    0x0e, 0x1f, 0xba, 0x0e, 0x00, 0xb4, 0x09, 0xcd, 0x21, 0xb8, 0x01, 0x4c, 0xcd, 0x21,
  ];
  dosCode.forEach((b, i) => {
    out[0x40 + i] = b;
  });
  writeAscii(out, 0x4e, 'This program cannot be run in DOS mode.\r\n$');

  // 2. PE Signature at 0x80
  out[eLfanew] = 0x50; // 'P'
  out[eLfanew + 1] = 0x45; // 'E'
  out[eLfanew + 2] = 0x00;
  out[eLfanew + 3] = 0x00;

  // 3. COFF File Header (20 bytes at 0x84)
  const coffOff = eLfanew + 4;
  const optSize = is64 ? 240 : 224;
  // Characteristics: IMAGE_FILE_EXECUTABLE_IMAGE (0x0002) | IMAGE_FILE_LARGE_ADDRESS_AWARE (0x0020) | IMAGE_FILE_DLL (0x2000)
  // For x86: include IMAGE_FILE_32BIT_MACHINE (0x0100)
  const characteristics = is64 ? 0x2022 : 0x2102;
  dv.setUint16(coffOff + 0, is64 ? 0x8664 : 0x014c, true); // Machine
  dv.setUint16(coffOff + 2, 3, true); // NumberOfSections (.text, .rdata, .data)
  dv.setUint32(coffOff + 4, Math.floor(Date.now() / 1000), true); // TimeDateStamp
  dv.setUint32(coffOff + 8, 0, true); // PointerToSymbolTable
  dv.setUint32(coffOff + 12, 0, true); // NumberOfSymbols
  dv.setUint16(coffOff + 16, optSize, true); // SizeOfOptionalHeader
  dv.setUint16(coffOff + 18, characteristics, true); // Characteristics

  // 4. Optional Header (at 0x98)
  const optOff = coffOff + 20;
  const subsystem = options.subsystem === 'console' ? 3 : 2;
  const dllCharacteristics = 0x0140; // DYNAMIC_BASE (0x0040) | NX_COMPAT (0x0100)
  const exportDirOffsetInRdata = 0;

  // Prepare .rdata Export Table first so we know exact export table size
  // Layout inside .rdata (RVA 0x2000):
  // 0x00..0x27 (40 bytes): IMAGE_EXPORT_DIRECTORY
  // 0x28..0x2F (8 bytes): AddressOfFunctions [0x1000, 0x1010]
  // 0x30..0x37 (8 bytes): AddressOfNames [0x2040, 0x2050]
  // 0x38..0x3B (4 bytes): AddressOfNameOrdinals [0, 1]
  // 0x40..0x4F: "DllMain\0"
  // 0x50..0x8F: "<exportSymbol>\0"
  // 0x90..0xCF: "<dllInternalName>\0"
  const dllNameRel = 0x90;
  const sym1Rel = 0x40;
  const sym2Rel = 0x50;

  dv.setUint32(rdataRawOffset + exportDirOffsetInRdata + 0, 0, true); // Characteristics
  dv.setUint32(rdataRawOffset + exportDirOffsetInRdata + 4, Math.floor(Date.now() / 1000), true); // TimeDateStamp
  dv.setUint16(rdataRawOffset + exportDirOffsetInRdata + 8, 1, true); // MajorVersion
  dv.setUint16(rdataRawOffset + exportDirOffsetInRdata + 10, 0, true); // MinorVersion
  dv.setUint32(rdataRawOffset + exportDirOffsetInRdata + 12, rdataRva + dllNameRel, true); // Name RVA
  dv.setUint32(rdataRawOffset + exportDirOffsetInRdata + 16, 1, true); // Base ordinal
  dv.setUint32(rdataRawOffset + exportDirOffsetInRdata + 20, 2, true); // NumberOfFunctions
  dv.setUint32(rdataRawOffset + exportDirOffsetInRdata + 24, 2, true); // NumberOfNames
  dv.setUint32(rdataRawOffset + exportDirOffsetInRdata + 28, rdataRva + 0x28, true); // AddressOfFunctions
  dv.setUint32(rdataRawOffset + exportDirOffsetInRdata + 32, rdataRva + 0x30, true); // AddressOfNames
  dv.setUint32(rdataRawOffset + exportDirOffsetInRdata + 36, rdataRva + 0x38, true); // AddressOfNameOrdinals

  // Functions
  dv.setUint32(rdataRawOffset + 0x28, textRva + 0x00, true); // DllMain
  dv.setUint32(rdataRawOffset + 0x2c, textRva + 0x10, true); // Exported Symbol
  // Names
  dv.setUint32(rdataRawOffset + 0x30, rdataRva + sym1Rel, true);
  dv.setUint32(rdataRawOffset + 0x34, rdataRva + sym2Rel, true);
  // Ordinals
  dv.setUint16(rdataRawOffset + 0x38, 0, true);
  dv.setUint16(rdataRawOffset + 0x3a, 1, true);

  writeAscii(out, rdataRawOffset + sym1Rel, 'DllMain');
  writeAscii(out, rdataRawOffset + sym2Rel, rawSymbol, 60);
  const dllNameLen = writeAscii(out, rdataRawOffset + dllNameRel, dllInternalName, 60);
  const exportDirSize = dllNameRel + dllNameLen + 1;

  // Populate Optional Header fields
  dv.setUint16(optOff + 0, is64 ? 0x020b : 0x010b, true); // Magic (PE32+ vs PE32)
  out[optOff + 2] = 14; // MajorLinkerVersion
  out[optOff + 3] = 38; // MinorLinkerVersion
  dv.setUint32(optOff + 4, textRawSize, true); // SizeOfCode
  dv.setUint32(optOff + 8, rdataRawSize + alignedDataRawSize, true); // SizeOfInitializedData
  dv.setUint32(optOff + 12, 0, true); // SizeOfUninitializedData
  dv.setUint32(optOff + 16, textRva, true); // AddressOfEntryPoint (DllMain)
  dv.setUint32(optOff + 20, textRva, true); // BaseOfCode

  if (is64) {
    dv.setBigUint64(optOff + 24, BigInt('0x180000000'), true); // ImageBase (64-bit DLL standard)
    dv.setUint32(optOff + 32, sectionAlignment, true);
    dv.setUint32(optOff + 36, fileAlignment, true);
    dv.setUint16(optOff + 40, 6, true); // MajorOSVersion
    dv.setUint16(optOff + 42, 0, true);
    dv.setUint16(optOff + 44, 1, true); // MajorImageVersion
    dv.setUint16(optOff + 48, 6, true); // MajorSubsystemVersion
    dv.setUint32(optOff + 56, sizeOfImage, true);
    dv.setUint32(optOff + 60, headersRawSize, true);
    dv.setUint16(optOff + 68, subsystem, true);
    dv.setUint16(optOff + 70, dllCharacteristics, true);
    dv.setBigUint64(optOff + 72, BigInt(0x100000), true); // SizeOfStackReserve
    dv.setBigUint64(optOff + 80, BigInt(0x1000), true); // SizeOfStackCommit
    dv.setBigUint64(optOff + 88, BigInt(0x100000), true); // SizeOfHeapReserve
    dv.setBigUint64(optOff + 96, BigInt(0x1000), true); // SizeOfHeapCommit
    dv.setUint32(optOff + 108, 16, true); // NumberOfRvaAndSizes
    // Export Data Directory (index 0 at optOff + 112)
    dv.setUint32(optOff + 112, rdataRva + exportDirOffsetInRdata, true);
    dv.setUint32(optOff + 116, exportDirSize, true);
  } else {
    dv.setUint32(optOff + 24, rdataRva, true); // BaseOfData
    dv.setUint32(optOff + 28, 0x10000000, true); // ImageBase (32-bit DLL standard)
    dv.setUint32(optOff + 32, sectionAlignment, true);
    dv.setUint32(optOff + 36, fileAlignment, true);
    dv.setUint16(optOff + 40, 6, true);
    dv.setUint16(optOff + 44, 1, true);
    dv.setUint16(optOff + 48, 6, true);
    dv.setUint32(optOff + 56, sizeOfImage, true);
    dv.setUint32(optOff + 60, headersRawSize, true);
    dv.setUint16(optOff + 68, subsystem, true);
    dv.setUint16(optOff + 70, dllCharacteristics, true);
    dv.setUint32(optOff + 72, 0x100000, true);
    dv.setUint32(optOff + 76, 0x1000, true);
    dv.setUint32(optOff + 80, 0x100000, true);
    dv.setUint32(optOff + 84, 0x1000, true);
    dv.setUint32(optOff + 92, 16, true); // NumberOfRvaAndSizes
    // Export Data Directory (index 0 at optOff + 96)
    dv.setUint32(optOff + 96, rdataRva + exportDirOffsetInRdata, true);
    dv.setUint32(optOff + 100, exportDirSize, true);
  }

  // 5. Section Headers (3 * 40 bytes immediately after Optional Header)
  const secOff = optOff + optSize;
  const writeSectionHeader = (
    idx: number,
    name: string,
    virtualSize: number,
    virtualAddress: number,
    sizeOfRawData: number,
    pointerToRawData: number,
    secChars: number
  ) => {
    const off = secOff + idx * 40;
    writeAscii(out, off, name, 8);
    dv.setUint32(off + 8, virtualSize, true);
    dv.setUint32(off + 12, virtualAddress, true);
    dv.setUint32(off + 16, sizeOfRawData, true);
    dv.setUint32(off + 20, pointerToRawData, true);
    dv.setUint32(off + 36, secChars, true);
  };

  writeSectionHeader(0, '.text', 0x40, textRva, textRawSize, textRawOffset, 0x60000020);
  writeSectionHeader(1, '.rdata', exportDirSize, rdataRva, rdataRawSize, rdataRawOffset, 0x40000040);
  writeSectionHeader(2, '.data', rawDataSectionLen, dataRva, alignedDataRawSize, dataRawOffset, 0xc0000040);

  // 6. .text Machine Code
  if (is64) {
    // DllMain: mov eax, 1; ret
    out.set([0xb8, 0x01, 0x00, 0x00, 0x00, 0xc3], textRawOffset);
    // Exported function: lea rax, [rip + 0x1FF9] (points near .data), ret — clean 64-bit stub: mov eax, payloadLen; ret
    out[textRawOffset + 0x10] = 0xb8;
    dv.setUint32(textRawOffset + 0x11, payloadBytes.length >>> 0, true);
    out[textRawOffset + 0x15] = 0xc3;
  } else {
    // x86 DllMain (stdcall 3 args = 12 bytes): mov eax, 1; ret 12
    out.set([0xb8, 0x01, 0x00, 0x00, 0x00, 0xc2, 0x0c, 0x00], textRawOffset);
    // Exported function: mov eax, payloadLen; ret
    out[textRawOffset + 0x10] = 0xb8;
    dv.setUint32(textRawOffset + 0x11, payloadBytes.length >>> 0, true);
    out[textRawOffset + 0x15] = 0xc3;
  }

  // 7. .data Embedded Payload ("CHGZ" + nameLen[u16] + payloadLen[u32] + name + payload)
  out[dataRawOffset + 0] = 0x43; // 'C'
  out[dataRawOffset + 1] = 0x48; // 'H'
  out[dataRawOffset + 2] = 0x47; // 'G'
  out[dataRawOffset + 3] = 0x5a; // 'Z'
  dv.setUint16(dataRawOffset + 4, safeNameBytes.length, true);
  dv.setUint32(dataRawOffset + 6, payloadBytes.length >>> 0, true);
  out.set(safeNameBytes, dataRawOffset + 10);
  out.set(payloadBytes, dataRawOffset + dataHeaderSize);

  return out;
}

/**
 * Parse a PE/COFF DLL buffer and extract headers, sections, and any Chang-Itz payload.
 */
export function parsePeDllBytes(bytes: Uint8Array): ParsedPeInfo {
  if (bytes.length < 0x40 || bytes[0] !== 0x4d || bytes[1] !== 0x5a) {
    return {
      isValidPe: false,
      isDll: false,
      architecture: 'Unknown',
      machineCode: 0,
      characteristics: 0,
      timestamp: '',
      entryPointRva: 0,
      imageBase: '0x0',
      subsystem: 0,
      sections: [],
    };
  }

  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eLfanew = dv.getUint32(0x3c, true);
  if (eLfanew + 24 > bytes.length) {
    return {
      isValidPe: false,
      isDll: false,
      architecture: 'Unknown',
      machineCode: 0,
      characteristics: 0,
      timestamp: '',
      entryPointRva: 0,
      imageBase: '0x0',
      subsystem: 0,
      sections: [],
    };
  }

  const hasPeSig =
    bytes[eLfanew] === 0x50 &&
    bytes[eLfanew + 1] === 0x45 &&
    bytes[eLfanew + 2] === 0x00 &&
    bytes[eLfanew + 3] === 0x00;

  if (!hasPeSig) {
    return {
      isValidPe: false,
      isDll: false,
      architecture: 'Unknown',
      machineCode: 0,
      characteristics: 0,
      timestamp: '',
      entryPointRva: 0,
      imageBase: '0x0',
      subsystem: 0,
      sections: [],
    };
  }

  const coffOff = eLfanew + 4;
  const machine = dv.getUint16(coffOff, true);
  const numSections = dv.getUint16(coffOff + 2, true);
  const timestampSec = dv.getUint32(coffOff + 4, true);
  const optSize = dv.getUint16(coffOff + 16, true);
  const characteristics = dv.getUint16(coffOff + 18, true);

  const archMap: Record<number, ParsedPeInfo['architecture']> = {
    0x8664: 'x64 (AMD64)',
    0x014c: 'x86 (i386)',
    0xaa64: 'ARM64',
  };

  const optOff = coffOff + 20;
  let entryPointRva = 0;
  let imageBase = '0x0';
  let subsystem = 0;

  if (optOff + 72 <= bytes.length && optSize >= 72) {
    const magic = dv.getUint16(optOff, true);
    entryPointRva = dv.getUint32(optOff + 16, true);
    if (magic === 0x020b) {
      imageBase = '0x' + dv.getBigUint64(optOff + 24, true).toString(16).toUpperCase();
      subsystem = dv.getUint16(optOff + 68, true);
    } else if (magic === 0x010b) {
      imageBase = '0x' + dv.getUint32(optOff + 28, true).toString(16).toUpperCase();
      subsystem = dv.getUint16(optOff + 68, true);
    }
  }

  const sections: ParsedPeInfo['sections'] = [];
  const secOff = optOff + optSize;
  let embeddedChangItzFileName: string | undefined;
  let embeddedPayloadBytes: Uint8Array | undefined;

  for (let i = 0; i < Math.min(numSections, 64); i++) {
    const off = secOff + i * 40;
    if (off + 40 > bytes.length) break;
    let secName = '';
    for (let j = 0; j < 8; j++) {
      if (bytes[off + j] === 0) break;
      secName += String.fromCharCode(bytes[off + j]);
    }
    const virtualSize = dv.getUint32(off + 8, true);
    const virtualAddress = dv.getUint32(off + 12, true);
    const rawSize = dv.getUint32(off + 16, true);
    const rawOffset = dv.getUint32(off + 20, true);
    const secChars = dv.getUint32(off + 36, true);

    sections.push({
      name: secName || `.sec${i}`,
      virtualSize,
      virtualAddress: '0x' + virtualAddress.toString(16).toUpperCase(),
      rawSize,
      rawOffset,
      characteristics: '0x' + secChars.toString(16).toUpperCase(),
    });

    if (
      secName === '.data' &&
      rawOffset + 10 <= bytes.length &&
      bytes[rawOffset] === 0x43 &&
      bytes[rawOffset + 1] === 0x48 &&
      bytes[rawOffset + 2] === 0x47 &&
      bytes[rawOffset + 3] === 0x5a
    ) {
      const nameLen = dv.getUint16(rawOffset + 4, true);
      const payloadLen = dv.getUint32(rawOffset + 6, true);
      if (rawOffset + 10 + nameLen + payloadLen <= bytes.length) {
        embeddedChangItzFileName = new TextDecoder().decode(bytes.slice(rawOffset + 10, rawOffset + 10 + nameLen));
        embeddedPayloadBytes = bytes.slice(rawOffset + 10 + nameLen, rawOffset + 10 + nameLen + payloadLen);
      }
    }
  }

  return {
    isValidPe: true,
    isDll: (characteristics & 0x2000) !== 0,
    architecture: archMap[machine] || 'Unknown',
    machineCode: machine,
    characteristics,
    timestamp: new Date(timestampSec * 1000).toISOString(),
    entryPointRva,
    imageBase,
    subsystem,
    sections,
    embeddedChangItzFileName,
    embeddedPayloadBytes,
  };
}

export async function convertToDll(
  file: File,
  params: ConversionParams = {}
): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  const arch = params.dllArch === 'x86' ? 'x86' : 'x64';
  const exportName = String(params.exportSymbol || 'ChangItzEntry');
  const subsystem = params.subsystem === 'console' ? 'console' : 'gui';

  logs.push(createLog('info', `Compiling Windows PE/COFF Dynamic-Link Library (.dll) for ${file.name} [${arch.toUpperCase()}]...`));

  const payloadBytes = new Uint8Array(await file.arrayBuffer());
  const dllBytes = buildPeDllBytes(payloadBytes, {
    arch,
    exportName,
    subsystem,
    sourceFileName: file.name,
  });

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'module';
  const outputName = `${baseName}.dll`;
  const mimeType = 'application/x-msdownload';
  const blob = new Blob([dllBytes.slice().buffer], { type: mimeType });

  logs.push(createLog('success', `Generated valid PE/${arch === 'x64' ? 'PE32+' : 'PE32'} DLL (${dllBytes.length} bytes) with IMAGE_FILE_DLL (0x2000), .text/.rdata/.data sections, and exported symbol "${exportName}"`));

  return {
    data: blob,
    outputName,
    outputFormat: 'dll',
    mimeType,
    previewType: 'text',
    textContent: [
      `// Windows Portable Executable DLL Disassembly Summary`,
      `// Output File: ${outputName} (${dllBytes.length} bytes)`,
      `// Magic Headers: MZ (0x5A4D) -> e_lfanew 0x80 -> PE\\0\\0`,
      `// Architecture: ${arch === 'x64' ? 'AMD64 (x64 / PE32+ Magic 0x020B)' : 'i386 (x86 / PE32 Magic 0x010B)'}`,
      `// Characteristics: 0x${(arch === 'x64' ? 0x2022 : 0x2102).toString(16).toUpperCase()} (IMAGE_FILE_DLL | EXECUTABLE_IMAGE)`,
      `// Exports: DllMain (RVA 0x1000), ${exportName} (RVA 0x1010)`,
      `// Sections:`,
      `//   .text   RVA 0x1000 | Raw 0x0400 (512 B)  [CODE | EXECUTE | READ]`,
      `//   .rdata  RVA 0x2000 | Raw 0x0600 (512 B)  [EXPORT DIRECTORY | READ]`,
      `//   .data   RVA 0x3000 | Raw 0x0800 (${dllBytes.length - 0x800} B) [CHGZ PAYLOAD: ${file.name}]`,
    ].join('\n'),
    logs,
    executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
    originalSizeBytes: file.size,
    convertedSizeBytes: blob.size,
  };
}

export async function convertFromDll(
  file: File,
  targetFormat: string
): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  const rawBytes = new Uint8Array(await file.arrayBuffer());
  const info = parsePeDllBytes(rawBytes);

  logs.push(createLog('info', `Inspecting Windows DLL PE/COFF headers for ${file.name}...`));

  const targetFmt = FORMATS[targetFormat] || FORMATS.json;
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'module';
  const outputName = `${baseName}${targetFmt.extension}`;

  if (info.embeddedPayloadBytes && !['json', 'txt', 'hexdump', 'base64'].includes(targetFormat)) {
    const extracted = new Blob([info.embeddedPayloadBytes.slice().buffer], { type: targetFmt.mimeTypes[0] || 'application/octet-stream' });
    logs.push(createLog('success', `Extracted embedded payload "${info.embeddedChangItzFileName}" (${info.embeddedPayloadBytes.length} bytes) from .data section`));
    return {
      data: extracted,
      outputName,
      outputFormat: targetFormat,
      mimeType: targetFmt.mimeTypes[0] || 'application/octet-stream',
      previewType: 'none',
      logs,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      originalSizeBytes: file.size,
      convertedSizeBytes: extracted.size,
    };
  }

  const report = {
    sourceFile: file.name,
    fileSize: file.size,
    peAnalysis: {
      isValidPe: info.isValidPe,
      isDll: info.isDll,
      architecture: info.architecture,
      machineCodeHex: '0x' + info.machineCode.toString(16).toUpperCase(),
      characteristicsHex: '0x' + info.characteristics.toString(16).toUpperCase(),
      timestamp: info.timestamp,
      entryPointRva: '0x' + info.entryPointRva.toString(16).toUpperCase(),
      imageBase: info.imageBase,
      subsystem: info.subsystem,
      sections: info.sections,
      embeddedChangItzFileName: info.embeddedChangItzFileName || null,
      embeddedPayloadBytes: info.embeddedPayloadBytes ? info.embeddedPayloadBytes.length : 0,
    },
  };

  const text = JSON.stringify(report, null, 2);
  const mimeType = targetFmt.mimeTypes[0] || 'application/json';
  const blob = new Blob([text], { type: mimeType });
  logs.push(createLog('success', `Parsed ${info.sections.length} PE sections (${info.architecture}) from ${file.name}`));

  return {
    data: blob,
    outputName,
    outputFormat: targetFormat,
    mimeType,
    previewType: 'text',
    textContent: text,
    logs,
    executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
    originalSizeBytes: file.size,
    convertedSizeBytes: blob.size,
  };
}
