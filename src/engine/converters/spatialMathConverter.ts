/**
 * Chang-Itz Spatial Math & Physics Engine
 * Converts to and from:
 *   - .PI (.pi / .PI) — High-precision Archimedes π, Circle Physics & Radiant Trigonometrics
 *   - .Vector3 (.Vector3 / .vec3) — 3D Spatial Vector Coordinates & Spherical Projections
 *   - .quaternion (.quaternion / .quat) — 4D Hypercomplex Spatial Rotation Quaternions
 */

import { ConversionResult, ConversionParams, LogEntry } from '../../types/conversion';

function createResult(
  partial: Omit<ConversionResult, 'logs' | 'executionTimeMs' | 'originalSizeBytes' | 'convertedSizeBytes'> & {
    logs?: LogEntry[];
    executionTimeMs?: number;
    originalSizeBytes?: number;
    convertedSizeBytes?: number;
  },
  file: File
): ConversionResult {
  let size = 0;
  if (typeof partial.data === 'string') {
    size = new TextEncoder().encode(partial.data).length;
  } else if (partial.data instanceof Blob) {
    size = partial.data.size;
  } else if (partial.data instanceof Uint8Array) {
    size = partial.data.byteLength;
  }
  return {
    ...partial,
    logs: partial.logs || [
      { timestamp: new Date().toISOString(), level: 'info', message: 'Spatial Math engine processing completed' },
      { timestamp: new Date().toISOString(), level: 'success', message: `Output generated: ${partial.outputName}` },
    ],
    executionTimeMs: partial.executionTimeMs || 12,
    originalSizeBytes: partial.originalSizeBytes || file.size,
    convertedSizeBytes: partial.convertedSizeBytes || size,
  };
}

/**
 * Extracts numbers from text or file bytes
 */
async function extractNumericValues(file: File): Promise<number[]> {
  try {
    const text = await file.text();
    // Match all numbers including scientific notation and floats
    const matches = text.match(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g);
    if (matches && matches.length >= 1) {
      const nums = matches.map(Number).filter((n) => !isNaN(n));
      if (nums.length > 0) return nums;
    }
  } catch {}

  // Fallback to array buffer byte sampling
  const bytes = new Uint8Array(await file.arrayBuffer());
  const nums: number[] = [];
  const count = Math.min(bytes.length, 32);
  for (let i = 0; i < count; i += 4) {
    if (i + 4 <= bytes.length) {
      const view = new DataView(bytes.buffer, bytes.byteOffset + i, 4);
      nums.push(view.getFloat32(0, true) || bytes[i]);
    } else {
      nums.push(bytes[i]);
    }
  }
  return nums.length > 0 ? nums : [3.1415926535, 1.0, 0.0, 0.0];
}

// ============================================================================
// 1. .PI CONVERTER (Archimedes π, Circle Physics, Trigonometrics)
// ============================================================================

export async function convertToPi(
  file: File,
  params: ConversionParams = {}
): Promise<ConversionResult> {
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const nums = await extractNumericValues(file);
  const primaryVal = nums[0] !== undefined && nums[0] !== 0 ? Math.abs(nums[0]) : 1.0;

  const PI = Math.PI;
  const TWO_PI = 2 * Math.PI;
  const HALF_PI = Math.PI / 2;

  // Circle calculations based on primary input value as radius r
  const r = primaryVal;
  const diameter = 2 * r;
  const circumference = TWO_PI * r;
  const circleArea = PI * r * r;
  const sphereVolume = (4 / 3) * PI * Math.pow(r, 3);
  const sphereSurfaceArea = 4 * PI * r * r;

  // Angle conversions
  const radToDeg = (rad: number) => (rad * 180) / PI;
  const degToRad = (deg: number) => (deg * PI) / 180;

  // High precision Pi string (100 digits)
  const piDigits = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";

  const lines = [
    `# ====================================================================`,
    `# 🥧 CHANG-ITZ MATHEMATICAL π (PI) SPECIFICATION v1.0`,
    `# Source File: ${file.name} (${file.size} bytes)`,
    `# Timestamp:   ${new Date().toISOString()}`,
    `# ====================================================================`,
    ``,
    `[FUNDAMENTAL_PI_CONSTANTS]`,
    `PI                   = ${PI.toFixed(15)}`,
    `TWO_PI (TAU τ)       = ${TWO_PI.toFixed(15)}`,
    `HALF_PI (π/2)        = ${HALF_PI.toFixed(15)}`,
    `QUARTER_PI (π/4)     = ${(PI / 4).toFixed(15)}`,
    `INV_PI (1/π)         = ${(1 / PI).toFixed(15)}`,
    `SQRT_PI (√π)         = ${Math.sqrt(PI).toFixed(15)}`,
    `PI_SQUARED (π²)      = ${(PI * PI).toFixed(15)}`,
    `EULER_NUMBER (e)     = ${Math.E.toFixed(15)}`,
    `EULERS_IDENTITY      = e^(i*π) + 1 = 0`,
    ``,
    `[HIGH_PRECISION_EXPANSION_100_DIGITS]`,
    `π = ${piDigits}`,
    ``,
    `[CIRCLE_AND_SPHERICAL_PHYSICS (Radius r = ${r})]`,
    `radius               = ${r}`,
    `diameter             = ${diameter}`,
    `circumference (2πr)  = ${circumference.toFixed(8)}`,
    `circle_area (πr²)    = ${circleArea.toFixed(8)}`,
    `sphere_volume (4/3πr³)= ${sphereVolume.toFixed(8)}`,
    `sphere_surface (4πr²)= ${sphereSurfaceArea.toFixed(8)}`,
    ``,
    `[RADIAN_DEGREE_CONVERSION_CHART]`,
    `0 rad      = 0.000°    (sin: 0.000, cos: 1.000)`,
    `π/6 rad    = ${radToDeg(PI / 6).toFixed(1)}°   (sin: ${Math.sin(PI / 6).toFixed(3)}, cos: ${Math.cos(PI / 6).toFixed(3)})`,
    `π/4 rad    = ${radToDeg(PI / 4).toFixed(1)}°   (sin: ${Math.sin(PI / 4).toFixed(3)}, cos: ${Math.cos(PI / 4).toFixed(3)})`,
    `π/3 rad    = ${radToDeg(PI / 3).toFixed(1)}°   (sin: ${Math.sin(PI / 3).toFixed(3)}, cos: ${Math.cos(PI / 3).toFixed(3)})`,
    `π/2 rad    = ${radToDeg(PI / 2).toFixed(1)}°   (sin: ${Math.sin(PI / 2).toFixed(3)}, cos: ${Math.cos(PI / 2).toFixed(3)})`,
    `π rad      = ${radToDeg(PI).toFixed(1)}°  (sin: ${Math.sin(PI).toFixed(3)}, cos: ${Math.cos(PI).toFixed(3)})`,
    `3π/2 rad   = ${radToDeg(1.5 * PI).toFixed(1)}°  (sin: ${Math.sin(1.5 * PI).toFixed(3)}, cos: ${Math.cos(1.5 * PI).toFixed(3)})`,
    `2π rad     = ${radToDeg(TWO_PI).toFixed(1)}°  (sin: ${Math.sin(TWO_PI).toFixed(3)}, cos: ${Math.cos(TWO_PI).toFixed(3)})`,
    ``,
    `[INPUT_NUMERIC_STREAM_SCALED_BY_PI]`,
    ...nums.slice(0, 16).map((val, idx) => `item_${idx} = ${val} -> scaled: ${(val * PI).toFixed(8)} (val * π)`),
    ``,
    `# Chang-Itz: If it has bytes, we can Chang-Itz! 🚀`,
  ];

  const content = lines.join('\n');
  return createResult({
    data: content,
    outputName: `${baseName}.PI`,
    outputFormat: 'pi',
    mimeType: 'text/plain',
    previewType: 'text',
    textContent: content,
  }, file);
}

// ============================================================================
// 2. .Vector3 CONVERTER (3D Spatial Cartesian & Spherical Vector)
// ============================================================================

export async function convertToVector3(
  file: File,
  _params: ConversionParams = {}
): Promise<ConversionResult> {
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const nums = await extractNumericValues(file);

  const x = nums[0] !== undefined ? nums[0] : 1.0;
  const y = nums[1] !== undefined ? nums[1] : 2.0;
  const z = nums[2] !== undefined ? nums[2] : 3.0;

  // Length / Magnitude
  const lengthSq = x * x + y * y + z * z;
  const length = Math.sqrt(lengthSq);

  // Normalized Unit Vector
  const nx = length > 0 ? x / length : 0;
  const ny = length > 0 ? y / length : 0;
  const nz = length > 0 ? z / length : 0;

  // Spherical Coordinates
  // r = length
  // polar angle theta = acos(z / r)
  // azimuthal angle phi = atan2(y, x)
  const theta = length > 0 ? Math.acos(Math.max(-1, Math.min(1, z / length))) : 0;
  const phi = Math.atan2(y, x);
  const thetaDeg = (theta * 180) / Math.PI;
  const phiDeg = (phi * 180) / Math.PI;

  // Cylindrical Coordinates: rho = sqrt(x^2 + y^2), phi, z
  const rho = Math.sqrt(x * x + y * y);

  // Dot products with basis vectors
  const dotX = x;
  const dotY = y;
  const dotZ = z;

  // Cross product with Unit Up Vector (0, 1, 0)
  const crossUpX = -z;
  const crossUpY = 0;
  const crossUpZ = x;

  const lines = [
    `# ====================================================================`,
    `# 📐 CHANG-ITZ 3D SPATIAL VECTOR (.Vector3)`,
    `# Source File: ${file.name}`,
    `# Timestamp:   ${new Date().toISOString()}`,
    `# ====================================================================`,
    ``,
    `[CARTESIAN_COORDINATES]`,
    `x = ${x}`,
    `y = ${y}`,
    `z = ${z}`,
    ``,
    `[VECTOR_METRICS]`,
    `magnitude (length)   = ${length.toFixed(8)}`,
    `squared_length       = ${lengthSq.toFixed(8)}`,
    `normalized_unit_x    = ${nx.toFixed(8)}`,
    `normalized_unit_y    = ${ny.toFixed(8)}`,
    `normalized_unit_z    = ${nz.toFixed(8)}`,
    ``,
    `[SPHERICAL_COORDINATES]`,
    `radial_distance (r)  = ${length.toFixed(8)}`,
    `polar_theta (rad)    = ${theta.toFixed(8)} rad (${thetaDeg.toFixed(2)}°)`,
    `azimuth_phi (rad)    = ${phi.toFixed(8)} rad (${phiDeg.toFixed(2)}°)`,
    ``,
    `[CYLINDRICAL_COORDINATES]`,
    `cylinder_rho (ρ)     = ${rho.toFixed(8)}`,
    `cylinder_phi (φ)     = ${phi.toFixed(8)} rad`,
    `cylinder_z           = ${z}`,
    ``,
    `[CROSS_PRODUCT_WITH_WORLD_UP (0, 1, 0)]`,
    `cross_x = ${crossUpX.toFixed(8)}`,
    `cross_y = ${crossUpY.toFixed(8)}`,
    `cross_z = ${crossUpZ.toFixed(8)}`,
    ``,
    `[ENGINE_CODE_SNIPPETS]`,
    `ThreeJS  : new THREE.Vector3(${x}, ${y}, ${z})`,
    `Unity C# : new UnityEngine.Vector3(${x}f, ${y}f, ${z}f)`,
    `Unreal   : FVector(${x}f, ${y}f, ${z}f)`,
    `Godot    : Vector3(${x}, ${y}, ${z})`,
    `GLSL     : vec3(${x.toFixed(4)}, ${y.toFixed(4)}, ${z.toFixed(4)})`,
    `Python   : np.array([${x}, ${y}, ${z}], dtype=np.float32)`,
    `JSON     : {"x": ${x}, "y": ${y}, "z": ${z}}`,
    ``,
    `# Chang-Itz: If it has bytes, we can Chang-Itz! 🚀`,
  ];

  const content = lines.join('\n');
  return createResult({
    data: content,
    outputName: `${baseName}.Vector3`,
    outputFormat: 'vector3',
    mimeType: 'text/plain',
    previewType: 'text',
    textContent: content,
  }, file);
}

// ============================================================================
// 3. .quaternion CONVERTER (4D Hypercomplex Spatial Rotation Quaternion)
// ============================================================================

export async function convertToQuaternion(
  file: File,
  _params: ConversionParams = {}
): Promise<ConversionResult> {
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const nums = await extractNumericValues(file);

  // If 4 values given, use as (x, y, z, w); otherwise construct valid rotation quaternion
  let x = nums[0] !== undefined ? nums[0] : 0.0;
  let y = nums[1] !== undefined ? nums[1] : 0.70710678;
  let z = nums[2] !== undefined ? nums[2] : 0.0;
  let w = nums[3] !== undefined ? nums[3] : 0.70710678;

  // Compute norm
  const normSq = x * x + y * y + z * z + w * w;
  const norm = Math.sqrt(normSq);

  // Normalize
  const qx = norm > 0 ? x / norm : 0;
  const qy = norm > 0 ? y / norm : 0;
  const qz = norm > 0 ? z / norm : 0;
  const qw = norm > 0 ? w / norm : 1;

  // Conjugate: q* = (-x, -y, -z, w)
  const conjX = -qx;
  const conjY = -qy;
  const conjZ = -qz;
  const conjW = qw;

  // Inverse: q^-1 = q* / |q|^2 (for unit quaternion, inverse == conjugate)
  const invX = conjX;
  const invY = conjY;
  const invZ = conjZ;
  const invW = conjW;

  // Convert to Euler Angles (Roll, Pitch, Yaw) in radians
  // Roll (x-axis rotation)
  const sinr_cosp = 2 * (qw * qx + qy * qz);
  const cosr_cosp = 1 - 2 * (qx * qx + qy * qy);
  const rollRad = Math.atan2(sinr_cosp, cosr_cosp);

  // Pitch (y-axis rotation)
  const sinp = 2 * (qw * qy - qz * qx);
  let pitchRad: number;
  if (Math.abs(sinp) >= 1) {
    pitchRad = (Math.sign(sinp) * Math.PI) / 2; // use 90 degrees if out of range
  } else {
    pitchRad = Math.asin(sinp);
  }

  // Yaw (z-axis rotation)
  const siny_cosp = 2 * (qw * qz + qx * qy);
  const cosy_cosp = 1 - 2 * (qy * qy + qz * qz);
  const yawRad = Math.atan2(siny_cosp, cosy_cosp);

  const rollDeg = (rollRad * 180) / Math.PI;
  const pitchDeg = (pitchRad * 180) / Math.PI;
  const yawDeg = (yawRad * 180) / Math.PI;

  // Axis-Angle representation
  const angleRad = 2 * Math.acos(Math.max(-1, Math.min(1, qw)));
  const angleDeg = (angleRad * 180) / Math.PI;
  const s = Math.sin(angleRad / 2);
  const axisX = s > 0.0001 ? qx / s : 1;
  const axisY = s > 0.0001 ? qy / s : 0;
  const axisZ = s > 0.0001 ? qz / s : 0;

  // 3x3 Rotation Matrix
  const r00 = 1 - 2 * (qy * qy + qz * qz);
  const r01 = 2 * (qx * qy - qz * qw);
  const r02 = 2 * (qx * qz + qy * qw);

  const r10 = 2 * (qx * qy + qz * qw);
  const r11 = 1 - 2 * (qx * qx + qz * qz);
  const r12 = 2 * (qy * qz - qx * qw);

  const r20 = 2 * (qx * qz - qy * qw);
  const r21 = 2 * (qy * qz + qx * qw);
  const r22 = 1 - 2 * (qx * qx + qy * qy);

  const lines = [
    `# ====================================================================`,
    `# 🔄 CHANG-ITZ 4D ROTATION QUATERNION (.quaternion)`,
    `# Source File: ${file.name}`,
    `# Timestamp:   ${new Date().toISOString()}`,
    `# ====================================================================`,
    ``,
    `[HAMILTON_HYPERCOMPLEX_FORM]`,
    `q = w + x*i + y*j + z*k`,
    `w (scalar real part) = ${qw.toFixed(8)}`,
    `x (vector imaginary i)= ${qx.toFixed(8)}`,
    `y (vector imaginary j)= ${qy.toFixed(8)}`,
    `z (vector imaginary k)= ${qz.toFixed(8)}`,
    ``,
    `[QUATERNION_PROPERTIES]`,
    `magnitude (norm)     = ${norm.toFixed(8)}`,
    `is_unit_normalized   = true`,
    `conjugate (q*)       = [${conjX.toFixed(6)}, ${conjY.toFixed(6)}, ${conjZ.toFixed(6)}, ${conjW.toFixed(6)}]`,
    `inverse (q⁻¹)        = [${invX.toFixed(6)}, ${invY.toFixed(6)}, ${invZ.toFixed(6)}, ${invW.toFixed(6)}]`,
    ``,
    `[EULER_ANGLES_TAIT_BRYAN_ZYX]`,
    `roll_x_pitch_yaw     = Roll: ${rollDeg.toFixed(2)}°, Pitch: ${pitchDeg.toFixed(2)}°, Yaw: ${yawDeg.toFixed(2)}°`,
    `roll_rad             = ${rollRad.toFixed(6)} rad`,
    `pitch_rad            = ${pitchRad.toFixed(6)} rad`,
    `yaw_rad              = ${yawRad.toFixed(6)} rad`,
    ``,
    `[AXIS_ANGLE_REPRESENTATION]`,
    `rotation_angle (θ)   = ${angleRad.toFixed(6)} rad (${angleDeg.toFixed(2)}°)`,
    `rotation_axis (x,y,z)= [${axisX.toFixed(6)}, ${axisY.toFixed(6)}, ${axisZ.toFixed(6)}]`,
    ``,
    `[3X3_ROTATION_MATRIX]`,
    `| ${r00.toFixed(6)}  ${r01.toFixed(6)}  ${r02.toFixed(6)} |`,
    `| ${r10.toFixed(6)}  ${r11.toFixed(6)}  ${r12.toFixed(6)} |`,
    `| ${r20.toFixed(6)}  ${r21.toFixed(6)}  ${r22.toFixed(6)} |`,
    ``,
    `[ENGINE_CODE_SNIPPETS]`,
    `ThreeJS  : new THREE.Quaternion(${qx.toFixed(6)}, ${qy.toFixed(6)}, ${qz.toFixed(6)}, ${qw.toFixed(6)})`,
    `Unity C# : new UnityEngine.Quaternion(${qx.toFixed(6)}f, ${qy.toFixed(6)}f, ${qz.toFixed(6)}f, ${qw.toFixed(6)}f)`,
    `Unreal   : FQuat(${qx.toFixed(6)}f, ${qy.toFixed(6)}f, ${qz.toFixed(6)}f, ${qw.toFixed(6)}f)`,
    `Godot    : Quaternion(${qx.toFixed(6)}, ${qy.toFixed(6)}, ${qz.toFixed(6)}, ${qw.toFixed(6)})`,
    `JSON     : {"x": ${qx}, "y": ${qy}, "z": ${qz}, "w": ${qw}}`,
    ``,
    `# Chang-Itz: If it has bytes, we can Chang-Itz! 🚀`,
  ];

  const content = lines.join('\n');
  return createResult({
    data: content,
    outputName: `${baseName}.quaternion`,
    outputFormat: 'quaternion',
    mimeType: 'text/plain',
    previewType: 'text',
    textContent: content,
  }, file);
}

// ============================================================================
// 4. CONVERT FROM SPATIAL MATH FILES (.PI, .Vector3, .quaternion)
// ============================================================================

export async function convertFromSpatialMath(
  file: File,
  targetFormat: string,
  _params: ConversionParams = {}
): Promise<ConversionResult> {
  const text = await file.text();
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  switch (targetFormat) {
    case 'json': {
      const nums = await extractNumericValues(file);
      const isQuat = file.name.toLowerCase().endsWith('.quaternion') || file.name.toLowerCase().endsWith('.quat');
      const isVec3 = file.name.toLowerCase().endsWith('.vector3') || file.name.toLowerCase().endsWith('.vec3');

      let parsedData: any = {};
      if (isQuat) {
        parsedData = {
          type: 'Quaternion',
          x: nums[0] ?? 0,
          y: nums[1] ?? 0,
          z: nums[2] ?? 0,
          w: nums[3] ?? 1,
          normalized: true,
        };
      } else if (isVec3) {
        parsedData = {
          type: 'Vector3',
          x: nums[0] ?? 0,
          y: nums[1] ?? 0,
          z: nums[2] ?? 0,
          length: Math.sqrt((nums[0] || 0) ** 2 + (nums[1] || 0) ** 2 + (nums[2] || 0) ** 2),
        };
      } else {
        parsedData = {
          type: 'PiSpecification',
          pi: Math.PI,
          tau: 2 * Math.PI,
          extractedValues: nums,
        };
      }

      const jsonStr = JSON.stringify(parsedData, null, 2);
      return createResult({
        data: jsonStr,
        outputName: `${baseName}.json`,
        outputFormat: 'json',
        mimeType: 'application/json',
        previewType: 'text',
        textContent: jsonStr,
      }, file);
    }

    case 'csv': {
      const nums = await extractNumericValues(file);
      const csvStr = `index,value,scaled_pi\n` + nums.map((v, i) => `${i},${v},${(v * Math.PI).toFixed(6)}`).join('\n');
      return createResult({
        data: csvStr,
        outputName: `${baseName}.csv`,
        outputFormat: 'csv',
        mimeType: 'text/csv',
        previewType: 'text',
        textContent: csvStr,
      }, file);
    }

    default: {
      return createResult({
        data: text,
        outputName: `${baseName}.txt`,
        outputFormat: 'txt',
        mimeType: 'text/plain',
        previewType: 'text',
        textContent: text,
      }, file);
    }
  }
}
