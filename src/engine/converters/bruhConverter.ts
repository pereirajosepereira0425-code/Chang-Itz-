import { ConversionResult, LogEntry } from '../../types/conversion';

/**
 * Generate a comedic synthesized 16-bit PCM WAV "BRUH" sound effect
 */
export function generateBruhAudioWav(durationSeconds: number = 1.0, sampleRate: number = 44100): Blob {
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // RIFF Chunk
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + numSamples * 2, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // FMT Chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);

  // DATA Chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, numSamples * 2, true);

  // Synthesize down-pitch vocal formant "BRUUUUH"
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = t / durationSeconds;

    // Pitch bends down from 140Hz -> 65Hz
    const freq = 140 * Math.pow(0.45, progress);
    const phase = 2 * Math.PI * freq * t;

    // Formant blend: fundamental + vocal harmonics
    const fundamental = Math.sin(phase);
    const formant1 = 0.5 * Math.sin(phase * 2.1);
    const formant2 = 0.3 * Math.sin(phase * 3.2);

    // Natural attack & decay envelope
    let envelope = 1.0;
    if (progress < 0.08) {
      envelope = progress / 0.08; // fast attack
    } else {
      envelope = Math.exp(-3.2 * (progress - 0.08)); // smooth decay
    }

    const sample = (fundamental + formant1 + formant2) * envelope * 0.75;
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Convert any file to the legendary .bruh format
 */
export async function convertToBruh(file: File): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Initializing .bruh Meme & Sound Transformation Engine for "${file.name}"` });

  let rawContent = '';
  try {
    rawContent = await file.text();
  } catch {
    rawContent = `[Binary file data: ${file.size} bytes]`;
  }

  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Synthesizing 110Hz->55Hz comedic sub-bass "BRUH" sound effect...` });
  const audioBlob = generateBruhAudioWav(1.1, 44100);
  const audioUrl = URL.createObjectURL(audioBlob);

  // Generate Bruh Translation
  const words = rawContent.replace(/\s+/g, ' ').trim().split(' ').slice(0, 100);
  const bruhTranslated = words
    .map((w, idx) => {
      if (idx % 4 === 0) return 'bruh';
      if (idx % 7 === 0) return 'BRUH 💀';
      if (idx % 5 === 0) return 'bruhhh...';
      if (idx % 9 === 0) return '🗿';
      return w.toUpperCase();
    })
    .join(' ');

  const bruhText = `======================================================================
🗿 OFFICIAL .BRUH MOMENT CONTAINER FILE (V2.5) 🗿
Certified by Chang-Itz Universal Engine
======================================================================

[BRUH_CONTAINER_METADATA]
Source_File        : ${file.name}
Source_Size        : ${(file.size / 1024).toFixed(2)} KB
Timestamp          : ${new Date().toISOString()}
Bruh_Rating        : 9001 / 9000 (Maximum Over-Bruh)
Emotional_State    : Certified Disappointment & Irony
Acoustic_Formant   : Resonant down-pitch "B-R-U-U-U-H" (Audio Attached)

[ASCII_BRUH_MONUMENT]
        ____________________
       /                    \\
      |   🗿     🗿     🗿   |  <--- TRI-BRUH COUNCIL OF ELDERS
      |                      |
      |       B R U H        |
       \\____________________/

[ORIGINAL_TEXT_BRUHIFIED]
${bruhTranslated.length > 0 ? bruhTranslated : 'bruh bruh bruh bruh BRUH 🗿'}

======================================================================
[END OF .BRUH FILE]
======================================================================
`;

  const blob = new Blob([bruhText], { type: 'text/plain' });
  const outputName = `${file.name.substring(0, file.name.lastIndexOf('.')) || file.name}.bruh`;

  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'success', message: `Successfully forged ${outputName} with embedded audio waveform!` });

  return {
    data: blob,
    outputName,
    outputFormat: 'bruh',
    mimeType: 'text/plain',
    previewType: 'audio',
    previewUrl: audioUrl,
    textContent: bruhText,
    logs,
    executionTimeMs: Math.round(performance.now() - startTime),
    originalSizeBytes: file.size,
    convertedSizeBytes: blob.size + audioBlob.size,
  };
}

/**
 * Convert a .bruh file into other formats (.wav audio, .txt, .json)
 */
export async function convertFromBruh(file: File, targetFormat: string): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Unpacking .bruh container "${file.name}"` });

  const text = await file.text();

  if (targetFormat === 'wav' || targetFormat === 'mp3' || targetFormat === 'tonesynth' || targetFormat === 'morseaudio') {
    logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Extracting synthesized "BRUH" audio waveform stream...` });
    const wavBlob = generateBruhAudioWav(1.2, 44100);
    const audioUrl = URL.createObjectURL(wavBlob);
    const outputName = `${file.name.replace(/\.bruh$/i, '')}.wav`;
    logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'success', message: `Extracted audio sound effect: ${outputName}` });

    return {
      data: wavBlob,
      outputName,
      outputFormat: 'wav',
      mimeType: 'audio/wav',
      previewType: 'audio',
      previewUrl: audioUrl,
      logs,
      executionTimeMs: Math.round(performance.now() - startTime),
      originalSizeBytes: file.size,
      convertedSizeBytes: wavBlob.size,
    };
  }

  // Extract JSON metadata
  if (targetFormat === 'json') {
    const jsonMetadata = {
      format: "bruh",
      version: "2.5",
      source_file: file.name,
      bruh_level: 9001,
      verdict: "CERTIFIED BRUH MOMENT",
      raw_lines_count: text.split('\n').length,
      extracted_at: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(jsonMetadata, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const outputName = `${file.name.replace(/\.bruh$/i, '')}.json`;

    return {
      data: blob,
      outputName,
      outputFormat: 'json',
      mimeType: 'application/json',
      previewType: 'text',
      textContent: jsonStr,
      logs,
      executionTimeMs: Math.round(performance.now() - startTime),
      originalSizeBytes: file.size,
      convertedSizeBytes: blob.size,
    };
  }

  // Default to plain text
  const cleanText = text.replace(/====+/g, '').trim();
  const blob = new Blob([cleanText], { type: 'text/plain' });
  const outputName = `${file.name.replace(/\.bruh$/i, '')}.txt`;

  return {
    data: blob,
    outputName,
    outputFormat: 'txt',
    mimeType: 'text/plain',
    previewType: 'text',
    textContent: cleanText,
    logs,
    executionTimeMs: Math.round(performance.now() - startTime),
    originalSizeBytes: file.size,
    convertedSizeBytes: blob.size,
  };
}
