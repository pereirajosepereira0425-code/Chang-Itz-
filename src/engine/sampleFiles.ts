import { FLIPACLIP_MASCOT_BASE64 } from './mascotBase64';

export interface SampleFile {
  name: string;
  category: string;
  emoji: string;
  description: string;
  file: File;
}

export function createSampleFiles(): SampleFile[] {
  // 1. Sample JSON
  const sampleJson = JSON.stringify([
    { id: 1, name: "Chang-Itz Nitro", category: "Engine", speed_factor: 9.8, active: true },
    { id: 2, name: "Pixel Dither", category: "Graphics", speed_factor: 8.5, active: true },
    { id: 3, name: "Vector Trace", category: "SVG", speed_factor: 7.2, active: false },
    { id: 4, name: "Morse Telegraph", category: "Audio", speed_factor: 10.0, active: true },
    { id: 5, name: "Crypto Vault", category: "Security", speed_factor: 9.9, active: true }
  ], null, 2);

  const jsonFile = new File([sampleJson], "chang_itz_fleet.json", { type: "application/json" });

  // 2. Sample Markdown
  const sampleMd = `# ⚡ Chang-Itz Engine Manifesto

> The universal in-browser conversion machine. Fast, private, and unlimited.

## 🚀 Key Capabilities
* **Zero Uploads**: Everything runs right in your browser memory
* **Dozens of Formats**: Images, Audio, Data, Code, Crypto, and Archives
* **Instant Feedback**: Live previews, byte diffs, and terminal audit logs

### Benchmark Matrix
| Format From | Format To | Pipeline | Latency |
| :--- | :--- | :--- | :--- |
| PNG | WebP | Canvas Hardware Accel | 12ms |
| JSON | CSV | Tabular Serializer | 2ms |
| Text | Morse Audio | 800Hz WebAudio PCM | 18ms |
| Image | ASCII Art | Luminance Density Grid | 24ms |

\`\`\`typescript
const result = await changItz.convert(file, 'webp');
console.log('Saved bytes:', result.savedPercent);
\`\`\`
`;
  const mdFile = new File([sampleMd], "chang_itz_manifesto.md", { type: "text/markdown" });

  // 3. Sample CSV
  const sampleCsv = `project,department,budget,status,lead
Chang-Itz Web,Core Tools,45000,Active,Jose Pereira
Pixel Dither,Graphics Lab,28000,Active,Elena Rostova
Subrip VTT,Media Pipeline,15000,Completed,Marcus Vance
Tone Synth,Audio FX,32000,Active,Chloe Bennett`;

  const csvFile = new File([sampleCsv], "company_projects.csv", { type: "text/csv" });

  // 4. Sample Subtitle SRT
  const sampleSrt = `1
00:00:01,000 --> 00:00:03,500
Welcome to Chang-Itz!

2
00:00:04,000 --> 00:00:07,800
The universal converter for any file or format.

3
00:00:08,200 --> 00:00:11,500
Transform images, data, audio, and code in milliseconds.`;

  const srtFile = new File([sampleSrt], "intro_subtitles.srt", { type: "text/plain" });

  // 5. Sample SVG Graphic (Chang-Itz Chameleon Lightning Badge)
  const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <linearGradient id="bolt" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="50%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="80" fill="url(#bg)"/>
  <circle cx="200" cy="200" r="140" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="6"/>
  <path d="M210 60 L130 210 L190 210 L170 340 L280 180 L210 180 Z" fill="url(#bolt)" filter="drop-shadow(0 0 16px rgba(245,158,11,0.6))"/>
  <text x="200" y="375" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="28" fill="#f8fafc" letter-spacing="4">CHANG-ITZ</text>
</svg>`;

  const svgFile = new File([sampleSvg], "chang_itz_badge.svg", { type: "image/svg+xml" });

  // 6. Sample .BRUH File
  const sampleBruh = `======================================================================
🗿 OFFICIAL .BRUH MOMENT CONTAINER FILE (V2.5) 🗿
Certified by Chang-Itz Universal Engine
======================================================================

[BRUH_CONTAINER_METADATA]
Source_File        : chang_itz_moments.txt
Timestamp          : 2026-10-15T23:30:00Z
Bruh_Rating        : 9001 / 9000 (Maximum Over-Bruh)
Verdict            : CERTIFIED BRUH MOMENT 💀
Acoustic_Formant   : Resonant down-pitch "B-R-U-U-U-H" (Audio Attached)

[ASCII_BRUH_MONUMENT]
        ____________________
       /                    \\
      |   🗿     🗿     🗿   |  <--- TRI-BRUH COUNCIL OF ELDERS
      |                      |
      |       B R U H        |
       \\____________________/

[ORIGINAL_TEXT_BRUHIFIED]
bruh when the code compiles on the first try but fails in production... BRUH 🗿

======================================================================
[END OF .BRUH FILE]
======================================================================`;
  const bruhFile = new File([sampleBruh], "certified_moment.bruh", { type: "text/plain" });

  // 7. Sample APK File (Android Package Stub)
  const apkHeader = new Uint8Array([
    0x50, 0x4b, 0x03, 0x04, // ZIP local header
    0x14, 0x00, 0x00, 0x00, 0x08, 0x00,
    0x41, 0x6e, 0x64, 0x72, 0x6f, 0x69, 0x64, 0x4d, 0x61, 0x6e, 0x69, 0x66, 0x65, 0x73, 0x74, 0x2e, 0x78, 0x6d, 0x6c // AndroidManifest.xml
  ]);
  const apkFile = new File([apkHeader], "chang_itz_launcher.apk", { type: "application/vnd.android.package-archive" });

  // 8. Sample XAPK File (Extended Package)
  const xapkContent = JSON.stringify({
    xapk_version: 1,
    package_name: "com.changitz.nitro",
    name: "Chang-Itz Nitro Game",
    version_code: "100",
    split_apks: [{ file: "base.apk", id: "base" }],
    expansions: [{ file: "main.100.com.changitz.nitro.obb" }]
  }, null, 2);
  const xapkFile = new File([xapkContent], "nitro_speed.xapk", { type: "application/x-xapk" });

  // 9. Sample Dolby TrueHD Audio Stream
  const truehdHeader = new Uint8Array([
    0xf8, 0x72, 0x6f, 0xba, // MLP Sync Word
    0x08, 0x30, 0x18, 0x01, // 8-ch 48kHz 24-bit TrueHD
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
  ]);
  const truehdFile = new File([truehdHeader], "dolby_surround_demo.truehd", { type: "audio/vnd.dolby.mlp" });

  // 10. Sample DDLC Monika Character File (.chr)
  // In Doki Doki Literature Club, monika.chr is a valid PNG image file disguised as .chr
  // Minimal valid 1x1 transparent/colored PNG with DDLC text metadata
  const monikaPngBytes = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG Signature
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00, 0x40, // 64x64
    0x08, 0x06, 0x00, 0x00, 0x00, 0xaa, 0x69, 0x71, 0xde,
    0x00, 0x00, 0x00, 0x1b, 0x74, 0x45, 0x58, 0x74, // tEXt chunk
    0x54, 0x69, 0x74, 0x6c, 0x65, 0x00, // Title: Just Monika
    0x4a, 0x75, 0x73, 0x74, 0x20, 0x4d, 0x6f, 0x6e, 0x69, 0x6b, 0x61, 0x2e, 0x20, 0x44, 0x44, 0x4c, 0x43,
    0x39, 0x55, 0x45, 0x30,
    0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, // IDAT
    0x78, 0x9c, 0x63, 0x60, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc, 0x33,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82 // IEND
  ]);
  const monikaFile = new File([monikaPngBytes], "monika.chr", { type: "application/octet-stream" });

  // 11. Sample DDLC Yuri Character File (.chr)
  // In DDLC, yuri.chr is a Base64-encoded dark psychological horror poem / story
  const yuriCipherStory = `=== DOKI DOKI LITERATURE CLUB - YURI.CHR ===
"I have had horrible thoughts recently. They won't stop whispering."

[ENCRYPTED POEM STREAM]
V2hlbiB0aGUgcmFpbiBiZWdpbnMgdG8gZmFsbCwgSSBjbG9zZSBteSBleWVzIGFuZCBsaXN0ZW4gdG8gdGhlIGRyb3BzLiBUaGV5IHNvdW5kIGxpa2UgdGhlIHNvZnQgd2hpc3BlcnMgb2YgYSBwYXN0IHRoYXQgd2FzIG5ldmVyIG1pbmUuIEp1c3QgYSBwb2VtLCBhIHJlZmxlY3Rpb24gaW4gYSBzaGF0dGVyZWQgbWlycm9yLiAtIFl1cmk=

=== END OF FILE ===`;
  const yuriFile = new File([yuriCipherStory], "yuri.chr", { type: "application/octet-stream" });

  // 12. Official Mascot Image File: The exact user FlipaClip artwork (NOT an SVG recreation)
  const byteCharacters = atob(FLIPACLIP_MASCOT_BASE64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const mascotFile = new File([byteArray], "chang_itz_mascot.jpg", { type: "image/jpeg" });

  // 13. Sample Nintendo NES 8-Bit Cartridge ROM (.nes)
  const nesHeader = new Uint8Array(16);
  nesHeader[0] = 0x4e; // 'N'
  nesHeader[1] = 0x45; // 'E'
  nesHeader[2] = 0x53; // 'S'
  nesHeader[3] = 0x1a; // EOF
  nesHeader[4] = 1; // 1x16KB PRG ROM bank
  nesHeader[5] = 1; // 1x8KB CHR ROM bank
  nesHeader[6] = 0x01; // Vertical mirroring, Mapper 0 (NROM)
  const nesTotal = new Uint8Array(16 + 16384 + 8192);
  nesTotal.set(nesHeader, 0);
  // Add 6502 reset vector
  nesTotal[16 + 16384 - 4] = 0x00;
  nesTotal[16 + 16384 - 3] = 0x80;
  const nesFile = new File([nesTotal], "super_chang_itz_bros.nes", { type: "application/x-nes-rom" });

  // 14. Sample Spreadsheet (.xlsb / .ods / .tsv)
  const sampleSpreadsheetTsv = `Quarter\tRevenue_USD\tExpenses_USD\tNet_Profit_USD\tGrowth_YoY\tAuditor
Q1_2026\t1450000\t890000\t560000\t+24.5%\tKPMG
Q2_2026\t1820000\t940000\t880000\t+32.1%\tKPMG
Q3_2026\t2150000\t1020000\t1130000\t+38.6%\tDeloitte
Q4_2026\t2890000\t1210000\t1680000\t+44.2%\tDeloitte`;
  const spreadsheetFile = new File([sampleSpreadsheetTsv], "global_financials_2026.tsv", { type: "text/tab-separated-values" });

  // 15. Sample Typography & Font Metric (.tfm / .fea / .ufo)
  const sampleFea = `# Adobe OpenType Feature File for Chang-Itz Sans
languagesystem DFLT dflt;
languagesystem latn dflt;

feature liga {
  sub f i by f_i;
  sub f l by f_l;
  sub f f by f_f;
  sub f f i by f_f_i;
} liga;

feature kern {
  pos A V -65;
  pos T o -45;
  pos W a -35;
  pos r quoteright 30;
} kern;
`;
  const typographyFile = new File([sampleFea], "chang_itz_typography.fea", { type: "text/plain" });

  // 16. Sample Relational & Analytical Database (.sql / .duckdb DDL)
  const sampleSqlDb = `-- ====================================================================
-- CHANG-ITZ RELATIONAL ENGINE DATABASE SCHEMA (SQLite / DuckDB / Postgres)
-- ====================================================================

CREATE TABLE formats_registry (
  format_id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  extension VARCHAR(16) NOT NULL,
  category VARCHAR(32) NOT NULL,
  is_binary BOOLEAN DEFAULT FALSE,
  total_conversions INT DEFAULT 0
);

CREATE TABLE conversion_audit_log (
  audit_id BIGSERIAL PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  source_format VARCHAR(16) NOT NULL,
  target_format VARCHAR(16) NOT NULL,
  bytes_in BIGINT NOT NULL,
  bytes_out BIGINT NOT NULL,
  execution_ms DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO formats_registry VALUES 
('nes', 'Nintendo Entertainment System ROM', '.nes', 'archive', TRUE, 128),
('xlsx', 'Excel OpenXML Spreadsheet', '.xlsx', 'spreadsheet', TRUE, 4520),
('sqlite', 'SQLite Relational Database', '.sqlite', 'database', TRUE, 2341),
('pressure', 'Pressure & Barometric Units', '.pressure', 'units', FALSE, 87);
`;
  const databaseFile = new File([sampleSqlDb], "chang_itz_schema.sql", { type: "application/sql" });

  // 17. Sample Physical Units & Dimensional Analysis (.unit / .dim)
  const sampleUnitsSpec = `# Unified Physical Measurement & Dimensional Specification
[SYSTEM_METADATA]
Standard = "BIPM International System of Units (SI) 9th Edition"
Revision = "2026 CODATA Recommended Values"

[FUNDAMENTAL_CONSTANTS]
c_speed_of_light = 299792458 m/s
h_planck_constant = 6.62607015e-34 J*s
G_gravitational = 6.67430e-11 m^3/(kg*s^2)
k_boltzmann = 1.380649e-23 J/K
e_elementary_charge = 1.602176634e-19 C

[PRESSURE_CONVERSIONS]
1 atm = 101325 Pa = 1.01325 bar = 14.6959 psi = 760 Torr

[ENERGY_EQUIVALENCES]
1 kWh = 3.6e6 J = 3412.14 BTU = 860420.65 cal = 2.247e25 eV
`;
  const unitsFile = new File([sampleUnitsSpec], "physics_dimensional_constants.unit", { type: "text/plain" });

  // 18. Sample Nintendo 64 ROM (.z64)
  const n64Rom = new Uint8Array(64 + 4032 + 8192);
  // PI BSD DOM1 reg config: 0x80371240 (Big-Endian native)
  n64Rom[0] = 0x80; n64Rom[1] = 0x37; n64Rom[2] = 0x12; n64Rom[3] = 0x40;
  // Clock rate
  n64Rom[4] = 0x00; n64Rom[5] = 0x00; n64Rom[6] = 0x00; n64Rom[7] = 0x0f;
  // Boot Program Counter: 0x80000400
  n64Rom[8] = 0x80; n64Rom[9] = 0x00; n64Rom[10] = 0x04; n64Rom[11] = 0x00;
  // CRC1 & CRC2
  n64Rom[16] = 0x63; n64Rom[17] = 0x5a; n64Rom[18] = 0x2b; n64Rom[19] = 0x3c;
  n64Rom[20] = 0x8b; n64Rom[21] = 0x64; n64Rom[22] = 0x12; n64Rom[23] = 0x57;
  // Title: SUPER MARIO 64
  const n64Title = "SUPER MARIO 64      ";
  for (let i = 0; i < 20; i++) n64Rom[32 + i] = n64Title.charCodeAt(i);
  // Game code: NSME (Super Mario 64 USA)
  n64Rom[59] = 0x4e; n64Rom[60] = 0x53; n64Rom[61] = 0x4d; n64Rom[62] = 0x45;
  n64Rom[63] = 0x00;
  const n64File = new File([n64Rom], "super_mario_64.z64", { type: "application/x-n64-rom" });

  // 19. Sample DOOM Game Resource WAD (.wad)
  const wadLump1Data = new Uint8Array([0x00, 0x00, 0x00, 0x01, 0x02, 0x03]); // Palette
  const wadLump2Data = new TextEncoder().encode("Chang-Itz E1M1: Hangar map block");
  const wadTotal = new Uint8Array(12 + wadLump1Data.length + wadLump2Data.length + 32);
  const wadView = new DataView(wadTotal.buffer);
  // Magic: "IWAD"
  wadTotal[0] = 0x49; wadTotal[1] = 0x57; wadTotal[2] = 0x41; wadTotal[3] = 0x44;
  wadView.setInt32(4, 2, true); // 2 lumps
  const wadDirOffset = 12 + wadLump1Data.length + wadLump2Data.length;
  wadView.setInt32(8, wadDirOffset, true);
  // Lump 1 data
  wadTotal.set(wadLump1Data, 12);
  // Lump 2 data
  wadTotal.set(wadLump2Data, 12 + wadLump1Data.length);
  // Lump 1 entry: offset 12, size 6, name "PLAYPAL"
  wadView.setInt32(wadDirOffset, 12, true);
  wadView.setInt32(wadDirOffset + 4, wadLump1Data.length, true);
  const name1 = "PLAYPAL\0";
  for (let i = 0; i < 8; i++) wadTotal[wadDirOffset + 8 + i] = name1.charCodeAt(i);
  // Lump 2 entry: offset 18, size len, name "E1M1"
  wadView.setInt32(wadDirOffset + 16, 12 + wadLump1Data.length, true);
  wadView.setInt32(wadDirOffset + 20, wadLump2Data.length, true);
  const name2 = "E1M1\0\0\0\0";
  for (let i = 0; i < 8; i++) wadTotal[wadDirOffset + 24 + i] = name2.charCodeAt(i);
  const wadFile = new File([wadTotal], "doom1_shareware.wad", { type: "application/x-doom-wad" });

  // 20. Sample High-Precision Archimedes Constant & Circle Physics (.PI)
  const samplePiContent = `# ====================================================================
# 🥧 CHANG-ITZ MATHEMATICAL π (PI) SPECIFICATION v1.0
# ====================================================================
[FUNDAMENTAL_PI_CONSTANTS]
PI                   = 3.141592653589793
TWO_PI (TAU τ)       = 6.283185307179586
HALF_PI (π/2)        = 1.570796326794897
EULERS_IDENTITY      = e^(i*π) + 1 = 0

[HIGH_PRECISION_EXPANSION]
π = 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679

[CIRCLE_PHYSICS (r = 5.0)]
radius               = 5.0
circumference (2πr)  = 31.41592654
circle_area (πr²)    = 78.53981634
sphere_volume        = 523.59877560
`;
  const piFile = new File([samplePiContent], "archimedes_circle.PI", { type: "text/plain" });

  // 21. Sample 3D Spatial Vector (.Vector3)
  const sampleVec3Content = `# ====================================================================
# 📐 CHANG-ITZ 3D SPATIAL VECTOR (.Vector3)
# ====================================================================
[CARTESIAN_COORDINATES]
x = 3.0
y = 4.0
z = 12.0

[VECTOR_METRICS]
magnitude (length)   = 13.00000000
normalized_unit_x    = 0.23076923
normalized_unit_y    = 0.30769231
normalized_unit_z    = 0.92307692

[ENGINE_CODE_SNIPPETS]
ThreeJS  : new THREE.Vector3(3.0, 4.0, 12.0)
Unity C# : new UnityEngine.Vector3(3.0f, 4.0f, 12.0f)
Unreal   : FVector(3.0f, 4.0f, 12.0f)
`;
  const vec3File = new File([sampleVec3Content], "velocity_vector.Vector3", { type: "text/plain" });

  // 22. Sample 4D Rotation Quaternion (.quaternion)
  const sampleQuatContent = `# ====================================================================
# 🔄 CHANG-ITZ 4D ROTATION QUATERNION (.quaternion)
# ====================================================================
[HAMILTON_HYPERCOMPLEX_FORM]
w = 0.70710678
x = 0.00000000
y = 0.70710678
z = 0.00000000

[EULER_ANGLES_TAIT_BRYAN_ZYX]
roll_x_pitch_yaw     = Roll: 0.00°, Pitch: 90.00°, Yaw: 0.00°

[AXIS_ANGLE_REPRESENTATION]
rotation_angle (θ)   = 1.570796 rad (90.00°)
rotation_axis (x,y,z)= [0.000000, 1.000000, 0.000000]

[ENGINE_CODE_SNIPPETS]
ThreeJS  : new THREE.Quaternion(0.0, 0.707107, 0.0, 0.707107)
Unity C# : new UnityEngine.Quaternion(0.0f, 0.707107f, 0.0f, 0.707107f)
`;
  const quatFile = new File([sampleQuatContent], "rotation_y90.quaternion", { type: "text/plain" });

  return [
    { name: "archimedes_circle.PI", category: "units", emoji: "🥧", description: "Archimedes π circle physics, radian trigonometrics & high-precision expansion", file: piFile },
    { name: "velocity_vector.Vector3", category: "model", emoji: "📐", description: "3D Spatial Cartesian vector (3, 4, 12) with magnitude & normalized unit vectors", file: vec3File },
    { name: "rotation_y90.quaternion", category: "model", emoji: "🔄", description: "4D Rotation Quaternion representing 90-degree yaw rotation around Y axis", file: quatFile },
    { name: "super_mario_64.z64", category: "archive", emoji: "🎮", description: "Authentic Nintendo 64 cartridge ROM in native Big-Endian byte order", file: n64File },
    { name: "doom1_shareware.wad", category: "archive", emoji: "👹", description: "id Software DOOM IWAD game resource package with lump directory", file: wadFile },
    { name: "super_chang_itz_bros.nes", category: "archive", emoji: "🎮", description: "Authentic 8-bit NES cartridge ROM with PRG code and CHR pattern sprite tables", file: nesFile },
    { name: "chang_itz_mascot.jpg", category: "image", emoji: "🦊", description: "Official Chang-Itz Mascot FlipaClip artwork (User authentic art)", file: mascotFile },
    { name: "global_financials_2026.tsv", category: "spreadsheet", emoji: "📊", description: "Tabular spreadsheet with quarterly revenues, expenses, profit & auditor notes", file: spreadsheetFile },
    { name: "chang_itz_typography.fea", category: "font", emoji: "🔤", description: "Adobe OpenType typographic feature specifications with ligatures & kerning pairs", file: typographyFile },
    { name: "chang_itz_schema.sql", category: "database", emoji: "🗄️", description: "Relational database schema with DDL tables, foreign keys, and audit logs", file: databaseFile },
    { name: "physics_dimensional_constants.unit", category: "units", emoji: "⚖️", description: "Physical units & dimensional analysis specification with CODATA constants", file: unitsFile },
    { name: "monika.chr", category: "creative", emoji: "🎀", description: "Doki Doki Literature Club Monika character file (hidden PNG)", file: monikaFile },
    { name: "yuri.chr", category: "creative", emoji: "📖", description: "Doki Doki Literature Club Yuri character file (encrypted poem)", file: yuriFile },
    { name: "certified_moment.bruh", category: "creative", emoji: "🗿", description: "Official Bruh moment file with sound effect", file: bruhFile },
    { name: "chang_itz_launcher.apk", category: "archive", emoji: "🤖", description: "Android mobile application package", file: apkFile },
    { name: "nitro_speed.xapk", category: "archive", emoji: "📦", description: "Android split package with APK and OBB", file: xapkFile },
    { name: "dolby_surround_demo.truehd", category: "audio", emoji: "🔊", description: "Dolby TrueHD 7.1 lossless surround master", file: truehdFile },
    { name: "chang_itz_badge.svg", category: "image", emoji: "📐", description: "Vector badge with lightning & gradient", file: svgFile },
    { name: "chang_itz_fleet.json", category: "data", emoji: "📦", description: "Array of structured configuration records", file: jsonFile },
    { name: "chang_itz_manifesto.md", category: "document", emoji: "📝", description: "Markdown with tables, code, blockquotes", file: mdFile },
    { name: "company_projects.csv", category: "spreadsheet", emoji: "📊", description: "Spreadsheet with projects, budget & leads", file: csvFile },
    { name: "intro_subtitles.srt", category: "document", emoji: "💬", description: "Timed SubRip subtitles ready for VTT", file: srtFile },
  ];
}
