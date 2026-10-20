export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

export interface UnitCategory {
  id: string;
  name: string;
  emoji: string;
  units: UnitDefinition[];
}

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'storage',
    name: 'Digital Storage',
    emoji: '💾',
    units: [
      { id: 'b', name: 'Bytes', symbol: 'B', toBase: (v) => v, fromBase: (v) => v },
      { id: 'bits', name: 'Bits', symbol: 'b', toBase: (v) => v / 8, fromBase: (v) => v * 8 },
      { id: 'kb', name: 'Kilobytes (1,000 B)', symbol: 'KB', toBase: (v) => v * 1e3, fromBase: (v) => v / 1e3 },
      { id: 'kib', name: 'Kibibytes (1,024 B)', symbol: 'KiB', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
      { id: 'mb', name: 'Megabytes (1,000 KB)', symbol: 'MB', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      { id: 'mib', name: 'Mebibytes (1,024 KiB)', symbol: 'MiB', toBase: (v) => v * 1024 ** 2, fromBase: (v) => v / 1024 ** 2 },
      { id: 'gb', name: 'Gigabytes', symbol: 'GB', toBase: (v) => v * 1e9, fromBase: (v) => v / 1e9 },
      { id: 'gib', name: 'Gibibytes', symbol: 'GiB', toBase: (v) => v * 1024 ** 3, fromBase: (v) => v / 1024 ** 3 },
      { id: 'tb', name: 'Terabytes', symbol: 'TB', toBase: (v) => v * 1e12, fromBase: (v) => v / 1e12 },
      { id: 'tib', name: 'Tebibytes', symbol: 'TiB', toBase: (v) => v * 1024 ** 4, fromBase: (v) => v / 1024 ** 4 },
      { id: 'pb', name: 'Petabytes', symbol: 'PB', toBase: (v) => v * 1e15, fromBase: (v) => v / 1e15 },
      { id: 'pib', name: 'Pebibytes', symbol: 'PiB', toBase: (v) => v * 1024 ** 5, fromBase: (v) => v / 1024 ** 5 },
      { id: 'mbits', name: 'Megabits', symbol: 'Mb', toBase: (v) => (v * 1e6) / 8, fromBase: (v) => (v * 8) / 1e6 },
      { id: 'gbits', name: 'Gigabits', symbol: 'Gb', toBase: (v) => (v * 1e9) / 8, fromBase: (v) => (v * 8) / 1e9 },
    ],
  },
  {
    id: 'length',
    name: 'Length & Distance',
    emoji: '📏',
    units: [
      { id: 'm', name: 'Meters', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
      { id: 'km', name: 'Kilometers', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'cm', name: 'Centimeters', symbol: 'cm', toBase: (v) => v / 100, fromBase: (v) => v / 0.01 },
      { id: 'mm', name: 'Millimeters', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'um', name: 'Micrometers (Microns)', symbol: 'µm', toBase: (v) => v * 1e-6, fromBase: (v) => v * 1e6 },
      { id: 'nm', name: 'Nanometers', symbol: 'nm', toBase: (v) => v * 1e-9, fromBase: (v) => v * 1e9 },
      { id: 'angstrom', name: 'Angstroms', symbol: 'Å', toBase: (v) => v * 1e-10, fromBase: (v) => v * 1e10 },
      { id: 'in', name: 'Inches', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      { id: 'ft', name: 'Feet', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { id: 'yd', name: 'Yards', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      { id: 'mi', name: 'Miles', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
      { id: 'nmi', name: 'Nautical Miles', symbol: 'NM', toBase: (v) => v * 1852, fromBase: (v) => v / 1852 },
      { id: 'au', name: 'Astronomical Units (AU)', symbol: 'AU', toBase: (v) => v * 149597870700, fromBase: (v) => v / 149597870700 },
      { id: 'ly', name: 'Light Years', symbol: 'ly', toBase: (v) => v * 9.460730472e15, fromBase: (v) => v / 9.460730472e15 },
      { id: 'pc', name: 'Parsecs', symbol: 'pc', toBase: (v) => v * 3.085677581e16, fromBase: (v) => v / 3.085677581e16 },
    ],
  },
  {
    id: 'weight',
    name: 'Mass & Weight',
    emoji: '⚖️',
    units: [
      { id: 'kg', name: 'Kilograms', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v },
      { id: 'g', name: 'Grams', symbol: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'mg', name: 'Milligrams', symbol: 'mg', toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
      { id: 'ug', name: 'Micrograms', symbol: 'µg', toBase: (v) => v / 1e9, fromBase: (v) => v * 1e9 },
      { id: 'ton', name: 'Metric Tons', symbol: 't', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'lb', name: 'Pounds', symbol: 'lb', toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
      { id: 'oz', name: 'Ounces', symbol: 'oz', toBase: (v) => v * 0.028349523125, fromBase: (v) => v / 0.028349523125 },
      { id: 'stone', name: 'Stones (UK)', symbol: 'st', toBase: (v) => v * 6.35029318, fromBase: (v) => v / 6.35029318 },
      { id: 'uston', name: 'US Short Tons', symbol: 'US ton', toBase: (v) => v * 907.18474, fromBase: (v) => v / 907.18474 },
      { id: 'ukton', name: 'Imperial Long Tons', symbol: 'long ton', toBase: (v) => v * 1016.0469088, fromBase: (v) => v / 1016.0469088 },
      { id: 'carat', name: 'Carats (Diamonds)', symbol: 'ct', toBase: (v) => v * 0.0002, fromBase: (v) => v / 0.0002 },
      { id: 'troyoz', name: 'Troy Ounces (Gold)', symbol: 'oz t', toBase: (v) => v * 0.0311034768, fromBase: (v) => v / 0.0311034768 },
    ],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    emoji: '🌡️',
    units: [
      { id: 'c', name: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
      { id: 'f', name: 'Fahrenheit', symbol: '°F', toBase: (v) => (v - 32) * (5 / 9), fromBase: (v) => v * (9 / 5) + 32 },
      { id: 'k', name: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
      { id: 'r', name: 'Rankine', symbol: '°R', toBase: (v) => (v - 491.67) * (5 / 9), fromBase: (v) => (v + 273.15) * (9 / 5) },
      { id: 'de', name: 'Delisle', symbol: '°De', toBase: (v) => 100 - v * (2 / 3), fromBase: (v) => (100 - v) * (3 / 2) },
      { id: 'n', name: 'Newton', symbol: '°N', toBase: (v) => v * (100 / 33), fromBase: (v) => v * (33 / 100) },
    ],
  },
  {
    id: 'speed',
    name: 'Speed & Velocity',
    emoji: '🏎️',
    units: [
      { id: 'ms', name: 'Meters per second', symbol: 'm/s', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kmh', name: 'Kilometers per hour', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      { id: 'mph', name: 'Miles per hour', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      { id: 'knot', name: 'Knots (Nautical)', symbol: 'kn', toBase: (v) => v * 0.514444444, fromBase: (v) => v / 0.514444444 },
      { id: 'fts', name: 'Feet per second', symbol: 'ft/s', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { id: 'mach', name: 'Mach (Sound speed in air)', symbol: 'M', toBase: (v) => v * 340.29, fromBase: (v) => v / 340.29 },
      { id: 'c', name: 'Speed of Light', symbol: 'c', toBase: (v) => v * 299792458, fromBase: (v) => v / 299792458 },
    ],
  },
  {
    id: 'time',
    name: 'Time & Duration',
    emoji: '⏱️',
    units: [
      { id: 's', name: 'Seconds', symbol: 's', toBase: (v) => v, fromBase: (v) => v },
      { id: 'ms', name: 'Milliseconds', symbol: 'ms', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'us', name: 'Microseconds', symbol: 'µs', toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
      { id: 'ns', name: 'Nanoseconds', symbol: 'ns', toBase: (v) => v / 1e9, fromBase: (v) => v * 1e9 },
      { id: 'min', name: 'Minutes', symbol: 'min', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
      { id: 'h', name: 'Hours', symbol: 'h', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      { id: 'd', name: 'Days', symbol: 'd', toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
      { id: 'w', name: 'Weeks', symbol: 'wk', toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
      { id: 'mo', name: 'Months (Average 30.44 d)', symbol: 'mo', toBase: (v) => v * 2629800, fromBase: (v) => v / 2629800 },
      { id: 'yr', name: 'Years (365.25 d)', symbol: 'yr', toBase: (v) => v * 31557600, fromBase: (v) => v / 31557600 },
      { id: 'dec', name: 'Decades', symbol: 'dec', toBase: (v) => v * 315576000, fromBase: (v) => v / 315576000 },
      { id: 'cent', name: 'Centuries', symbol: 'cent', toBase: (v) => v * 3155760000, fromBase: (v) => v / 3155760000 },
    ],
  },
  {
    id: 'area',
    name: 'Area & Land',
    emoji: '🗺️',
    units: [
      { id: 'sqm', name: 'Square Meters', symbol: 'm²', toBase: (v) => v, fromBase: (v) => v },
      { id: 'sqkm', name: 'Square Kilometers', symbol: 'km²', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      { id: 'sqcm', name: 'Square Centimeters', symbol: 'cm²', toBase: (v) => v * 1e-4, fromBase: (v) => v / 1e-4 },
      { id: 'sqmm', name: 'Square Millimeters', symbol: 'mm²', toBase: (v) => v * 1e-6, fromBase: (v) => v / 1e-6 },
      { id: 'sqin', name: 'Square Inches', symbol: 'in²', toBase: (v) => v * 0.00064516, fromBase: (v) => v / 0.00064516 },
      { id: 'sqft', name: 'Square Feet', symbol: 'ft²', toBase: (v) => v * 0.09290304, fromBase: (v) => v / 0.09290304 },
      { id: 'sqyd', name: 'Square Yards', symbol: 'yd²', toBase: (v) => v * 0.83612736, fromBase: (v) => v / 0.83612736 },
      { id: 'acre', name: 'Acres', symbol: 'ac', toBase: (v) => v * 4046.8564224, fromBase: (v) => v / 4046.8564224 },
      { id: 'ha', name: 'Hectares', symbol: 'ha', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
      { id: 'sqmi', name: 'Square Miles', symbol: 'mi²', toBase: (v) => v * 2589988.110336, fromBase: (v) => v / 2589988.110336 },
    ],
  },
  {
    id: 'volume',
    name: 'Volume & Capacity',
    emoji: '🧪',
    units: [
      { id: 'l', name: 'Liters', symbol: 'L', toBase: (v) => v, fromBase: (v) => v },
      { id: 'ml', name: 'Milliliters', symbol: 'mL', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'cum', name: 'Cubic Meters', symbol: 'm³', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'cucm', name: 'Cubic Centimeters (cc)', symbol: 'cm³', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'floz', name: 'US Fluid Ounces', symbol: 'fl oz', toBase: (v) => v * 0.0295735295625, fromBase: (v) => v / 0.0295735295625 },
      { id: 'cup', name: 'US Cups', symbol: 'cup', toBase: (v) => v * 0.2365882365, fromBase: (v) => v / 0.2365882365 },
      { id: 'pt', name: 'US Pints', symbol: 'pt', toBase: (v) => v * 0.473176473, fromBase: (v) => v / 0.473176473 },
      { id: 'qt', name: 'US Quarts', symbol: 'qt', toBase: (v) => v * 0.946352946, fromBase: (v) => v / 0.946352946 },
      { id: 'gal', name: 'US Gallons', symbol: 'gal', toBase: (v) => v * 3.785411784, fromBase: (v) => v / 3.785411784 },
      { id: 'ukgal', name: 'UK Imperial Gallons', symbol: 'imp gal', toBase: (v) => v * 4.54609, fromBase: (v) => v / 4.54609 },
      { id: 'cuft', name: 'Cubic Feet', symbol: 'ft³', toBase: (v) => v * 28.316846592, fromBase: (v) => v / 28.316846592 },
      { id: 'cuin', name: 'Cubic Inches', symbol: 'in³', toBase: (v) => v * 0.016387064, fromBase: (v) => v / 0.016387064 },
      { id: 'bbl', name: 'Oil Barrels', symbol: 'bbl', toBase: (v) => v * 158.987294928, fromBase: (v) => v / 158.987294928 },
    ],
  },
  {
    id: 'energy',
    name: 'Energy & Work',
    emoji: '⚡',
    units: [
      { id: 'j', name: 'Joules', symbol: 'J', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kj', name: 'Kilojoules', symbol: 'kJ', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'mj', name: 'Megajoules', symbol: 'MJ', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      { id: 'cal', name: 'Calories (thermochemical)', symbol: 'cal', toBase: (v) => v * 4.184, fromBase: (v) => v / 4.184 },
      { id: 'kcal', name: 'Kilocalories (Food kcal)', symbol: 'kcal', toBase: (v) => v * 4184, fromBase: (v) => v / 4184 },
      { id: 'wh', name: 'Watt-hours', symbol: 'Wh', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      { id: 'kwh', name: 'Kilowatt-hours', symbol: 'kWh', toBase: (v) => v * 3.6e6, fromBase: (v) => v / 3.6e6 },
      { id: 'ev', name: 'Electronvolts', symbol: 'eV', toBase: (v) => v * 1.602176634e-19, fromBase: (v) => v / 1.602176634e-19 },
      { id: 'btu', name: 'British Thermal Units (BTU)', symbol: 'BTU', toBase: (v) => v * 1055.05585, fromBase: (v) => v / 1055.05585 },
      { id: 'ftlb', name: 'Foot-Pounds', symbol: 'ft·lbf', toBase: (v) => v * 1.3558179483314, fromBase: (v) => v / 1.3558179483314 },
    ],
  },
  {
    id: 'pressure',
    name: 'Pressure',
    emoji: '💨',
    units: [
      { id: 'pa', name: 'Pascals', symbol: 'Pa', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kpa', name: 'Kilopascals', symbol: 'kPa', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'mpa', name: 'Megapascals', symbol: 'MPa', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      { id: 'bar', name: 'Bar', symbol: 'bar', toBase: (v) => v * 100000, fromBase: (v) => v / 100000 },
      { id: 'mbar', name: 'Millibar / hPa', symbol: 'mbar', toBase: (v) => v * 100, fromBase: (v) => v / 100 },
      { id: 'psi', name: 'Pounds per square inch (PSI)', symbol: 'psi', toBase: (v) => v * 6894.757293, fromBase: (v) => v / 6894.757293 },
      { id: 'atm', name: 'Standard Atmospheres', symbol: 'atm', toBase: (v) => v * 101325, fromBase: (v) => v / 101325 },
      { id: 'torr', name: 'Torr (mmHg)', symbol: 'Torr', toBase: (v) => v * 133.3223684, fromBase: (v) => v / 133.3223684 },
    ],
  },
  {
    id: 'power',
    name: 'Power & Wattage',
    emoji: '💡',
    units: [
      { id: 'w', name: 'Watts', symbol: 'W', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kw', name: 'Kilowatts', symbol: 'kW', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'mw', name: 'Megawatts', symbol: 'MW', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      { id: 'hp', name: 'Mechanical Horsepower', symbol: 'hp(I)', toBase: (v) => v * 745.699872, fromBase: (v) => v / 745.699872 },
      { id: 'hpm', name: 'Metric Horsepower (PS)', symbol: 'PS', toBase: (v) => v * 735.49875, fromBase: (v) => v / 735.49875 },
      { id: 'btuh', name: 'BTU per hour', symbol: 'BTU/h', toBase: (v) => v * 0.29307107, fromBase: (v) => v / 0.29307107 },
    ],
  },
  {
    id: 'bandwidth',
    name: 'Data Transfer Rate',
    emoji: '📡',
    units: [
      { id: 'bps', name: 'Bits per second', symbol: 'bps', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kbps', name: 'Kilobits/s', symbol: 'Kbps', toBase: (v) => v * 1e3, fromBase: (v) => v / 1e3 },
      { id: 'mbps', name: 'Megabits/s', symbol: 'Mbps', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      { id: 'gbps', name: 'Gigabits/s', symbol: 'Gbps', toBase: (v) => v * 1e9, fromBase: (v) => v / 1e9 },
      { id: 'tbps', name: 'Terabits/s', symbol: 'Tbps', toBase: (v) => v * 1e12, fromBase: (v) => v / 1e12 },
      { id: 'byts', name: 'Bytes/s', symbol: 'B/s', toBase: (v) => v * 8, fromBase: (v) => v / 8 },
      { id: 'kbs', name: 'Kilobytes/s', symbol: 'KB/s', toBase: (v) => v * 8 * 1e3, fromBase: (v) => v / (8 * 1e3) },
      { id: 'mbs', name: 'Megabytes/s', symbol: 'MB/s', toBase: (v) => v * 8 * 1e6, fromBase: (v) => v / (8 * 1e6) },
      { id: 'gbs', name: 'Gigabytes/s', symbol: 'GB/s', toBase: (v) => v * 8 * 1e9, fromBase: (v) => v / (8 * 1e9) },
    ],
  },
  {
    id: 'angle',
    name: 'Angles & Rotation',
    emoji: '📐',
    units: [
      { id: 'deg', name: 'Degrees', symbol: '°', toBase: (v) => v, fromBase: (v) => v },
      { id: 'rad', name: 'Radians', symbol: 'rad', toBase: (v) => v * (180 / Math.PI), fromBase: (v) => v * (Math.PI / 180) },
      { id: 'grad', name: 'Gradians (Gons)', symbol: 'grad', toBase: (v) => v * 0.9, fromBase: (v) => v / 0.9 },
      { id: 'arcmin', name: 'Arcminutes', symbol: '′', toBase: (v) => v / 60, fromBase: (v) => v * 60 },
      { id: 'arcsec', name: 'Arcseconds', symbol: '″', toBase: (v) => v / 3600, fromBase: (v) => v * 3600 },
      { id: 'turn', name: 'Turns / Full Rotations', symbol: 'tr', toBase: (v) => v * 360, fromBase: (v) => v / 360 },
      { id: 'mrad', name: 'Milliradians', symbol: 'mrad', toBase: (v) => v * (180 / Math.PI) / 1000, fromBase: (v) => (v * (Math.PI / 180)) * 1000 },
    ],
  },
  {
    id: 'typography',
    name: 'Typography & CSS',
    emoji: '🔤',
    units: [
      { id: 'pt', name: 'Points (Desktop Publishing)', symbol: 'pt', toBase: (v) => v, fromBase: (v) => v },
      { id: 'pc', name: 'Picas (1 pc = 12 pt)', symbol: 'pc', toBase: (v) => v * 12, fromBase: (v) => v / 12 },
      { id: 'px', name: 'Pixels (96 DPI standard)', symbol: 'px', toBase: (v) => v * 0.75, fromBase: (v) => v / 0.75 },
      { id: 'mm', name: 'Millimeters', symbol: 'mm', toBase: (v) => v * (72 / 25.4), fromBase: (v) => v / (72 / 25.4) },
      { id: 'in', name: 'Inches', symbol: 'in', toBase: (v) => v * 72, fromBase: (v) => v / 72 },
      { id: 'em', name: 'Em (assuming 16px baseline)', symbol: 'em', toBase: (v) => v * 12, fromBase: (v) => v / 12 },
    ],
  },
];

export function convertUnit(val: number, catId: string, fromId: string, toId: string): number {
  const cat = UNIT_CATEGORIES.find((c) => c.id === catId);
  if (!cat) return val;
  const fromU = cat.units.find((u) => u.id === fromId);
  const toU = cat.units.find((u) => u.id === toId);
  if (!fromU || !toU) return val;

  const baseVal = fromU.toBase(val);
  return toU.fromBase(baseVal);
}
