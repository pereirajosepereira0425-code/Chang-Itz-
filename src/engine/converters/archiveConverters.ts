import { ConversionParams, ConversionResult, LogEntry } from '../../types/conversion';
import JSZip from 'jszip';

/**
 * Creates a ZIP archive containing the provided file(s)
 */
export async function createZipArchive(files: File[], archiveName: string = 'chang_itz_archive.zip'): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Creating compressed ZIP container for ${files.length} file(s)` });

  const zip = new JSZip();
  let totalInputSize = 0;

  for (const file of files) {
    totalInputSize += file.size;
    const arrayBuffer = await file.arrayBuffer();
    zip.file(file.name, arrayBuffer);
    logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Added ${file.name} (${(file.size / 1024).toFixed(1)} KB)` });
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'success', message: `ZIP archive generated (${(zipBlob.size / 1024).toFixed(1)} KB)` });

  return {
    data: zipBlob,
    outputName: archiveName.endsWith('.zip') ? archiveName : `${archiveName}.zip`,
    outputFormat: 'zip',
    mimeType: 'application/zip',
    previewType: 'archive',
    logs,
    executionTimeMs: Math.round(performance.now() - startTime),
    originalSizeBytes: totalInputSize,
    convertedSizeBytes: zipBlob.size,
  };
}

/**
 * Unpacks a ZIP archive and lists contents / extracts
 */
export async function unpackZipArchive(file: File): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Reading and decompressing ${file.name}` });

  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const entries: { name: string; size: number; isDir: boolean }[] = [];
  zip.forEach((relativePath, zipEntry) => {
    entries.push({
      name: relativePath,
      size: (zipEntry as any)._data ? (zipEntry as any)._data.uncompressedSize || 0 : 0,
      isDir: zipEntry.dir,
    });
    logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Found archive entry: ${relativePath}` });
  });

  const manifest = {
    archiveName: file.name,
    totalFiles: entries.length,
    files: entries,
  };

  const textContent = JSON.stringify(manifest, null, 2);
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const outputBlob = new Blob([textContent], { type: 'application/json' });

  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'success', message: `Extracted metadata for ${entries.length} archived files` });

  return {
    data: outputBlob,
    outputName: `${baseName}_manifest.json`,
    outputFormat: 'json',
    mimeType: 'application/json',
    previewType: 'text',
    textContent,
    logs,
    executionTimeMs: Math.round(performance.now() - startTime),
    originalSizeBytes: file.size,
    convertedSizeBytes: outputBlob.size,
  };
}
