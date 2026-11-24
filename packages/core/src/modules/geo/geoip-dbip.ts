// IP geolocation from DB-IP's free "IP to City Lite" database (CC BY 4.0,
// https://db-ip.com), kept as two tables in a D1 database of its own:
//
//   geo_ranges_<g>    (s BLOB PRIMARY KEY, e BLOB, loc INTEGER)
//   geo_locations_<g> (id INTEGER PRIMARY KEY, country, region, city, lat, lon)
//
// Addresses are 16-byte keys (IPv4 as ::ffff:a.b.c.d), so one ordered index
// answers both families: the range whose start is the last one <= the address
// holds it if its end is >= the address. Each monthly refresh loads a new
// generation `<g>` and then switches to it, so readers never see half a load.

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const HEX_GROUP = /^[0-9a-f]{1,4}$/i;
const CONTROL = /[\u0000-\u001f]/g;
const FNV_OFFSET = 0xcbf2_9ce4_8422_2325n;
const FNV_PRIME = 0x100_0000_01b3n;
const ID_MASK = (1n << 52n) - 1n;

export const DBIP_ATTRIBUTION = 'IP geolocation by DB-IP (https://db-ip.com)';

/** DB-IP publishes on the 1st; the file for `yyyy-mm`. */
export function dbipCityLiteUrl(month: string): string {
  return `https://download.db-ip.com/free/dbip-city-lite-${month}.csv.gz`;
}

export function monthOf(ms: number): string {
  return new Date(ms).toISOString().slice(0, 7);
}

/** 16-byte key of an IPv4 or IPv6 address, or null if it is not one. */
export function ipToKey(ip: string): Uint8Array | null {
  const text = ip.trim();
  const v4 = IPV4.exec(text);
  if (v4) {
    const key = new Uint8Array(16);
    key[10] = 0xff;
    key[11] = 0xff;
    for (let i = 0; i < 4; i++) {
      const part = Number(v4[i + 1]);
      if (part > 255) {
        return null;
      }
      key[12 + i] = part;
    }
    return key;
  }
  return ipv6ToKey(text);
}

function ipv6ToKey(text: string): Uint8Array | null {
  if (!text.includes(':') || text.includes('%')) {
    return null;
  }
  // An embedded IPv4 tail (::ffff:1.2.3.4) becomes two hex groups.
  let address = text;
  const lastColon = address.lastIndexOf(':');
  const tail = address.slice(lastColon + 1);
  if (tail.includes('.')) {
    const v4 = ipToKey(tail);
    if (!v4) {
      return null;
    }
    const high = ((v4[12] ?? 0) << 8) | (v4[13] ?? 0);
    const low = ((v4[14] ?? 0) << 8) | (v4[15] ?? 0);
    address = `${address.slice(0, lastColon + 1)}${high.toString(16)}:${low.toString(16)}`;
  }
  const halves = address.split('::');
  if (halves.length > 2) {
    return null;
  }
  const head = halves[0] ? halves[0].split(':') : [];
  const rest = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const missing = 8 - head.length - rest.length;
  if (halves.length === 1 ? missing !== 0 : missing < 1) {
    return null;
  }
  const groups = [...head, ...new Array<string>(missing).fill('0'), ...rest];
  const key = new Uint8Array(16);
  for (let i = 0; i < 8; i++) {
    const group = groups[i] ?? '';
    if (!HEX_GROUP.test(group)) {
      return null;
    }
    const value = Number.parseInt(group, 16);
    key[i * 2] = value >> 8;
    key[i * 2 + 1] = value & 0xff;
  }
  return key;
}

export function keyHex(key: Uint8Array): string {
  let hex = '';
  for (const byte of key) {
    hex += byte.toString(16).padStart(2, '0');
  }
  return hex;
}

export function compareKeys(a: Uint8Array, b: Uint8Array): number {
  for (let i = 0; i < 16; i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}

export interface GeoipLocation {
  country: string;
  region: string;
  city: string;
  lat: number;
  lon: number;
}

export interface GeoipRange {
  start: Uint8Array;
  end: Uint8Array;
  location: GeoipLocation;
}

/** Splits one CSV line; DB-IP quotes fields that hold commas. */
function csvFields(line: string): string[] {
  const fields: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      fields.push(field);
      field = '';
    } else {
      field += char;
    }
  }
  fields.push(field);
  return fields;
}

/** `start,end,continent,country,region,city,lat,lon`, or null to skip. */
export function parseDbipLine(line: string): GeoipRange | null {
  const fields = csvFields(line.trim());
  if (fields.length < 8) {
    return null;
  }
  const start = ipToKey(fields[0] ?? '');
  const end = ipToKey(fields[1] ?? '');
  const lat = Number(fields[6]);
  const lon = Number(fields[7]);
  if (!(start && end && Number.isFinite(lat) && Number.isFinite(lon))) {
    return null;
  }
  const clean = (value: string | undefined) =>
    (value ?? '').replace(CONTROL, '').slice(0, 200);
  return {
    start,
    end,
    location: {
      country: clean(fields[3]).toUpperCase(),
      region: clean(fields[4]),
      city: clean(fields[5]),
      lat,
      lon,
    },
  };
}

/** A stable 52-bit id (FNV-1a), so every step names a location the same way. */
export function locationId(location: GeoipLocation): number {
  const text = `${location.country}|${location.region}|${location.city}|${location.lat}|${location.lon}`;
  let hash = FNV_OFFSET;
  for (let i = 0; i < text.length; i++) {
    hash ^= BigInt(text.charCodeAt(i));
    hash = BigInt.asUintN(64, hash * FNV_PRIME);
  }
  return Number(hash & ID_MASK);
}

function generationName(generation: number): string {
  if (!(Number.isInteger(generation) && generation > 0)) {
    throw new Error(`Invalid GeoIP generation ${generation}`);
  }
  return String(generation);
}

export function rangesTable(generation: number): string {
  return `geo_ranges_${generationName(generation)}`;
}

export function locationsTable(generation: number): string {
  return `geo_locations_${generationName(generation)}`;
}

export function createTablesSql(generation: number): string[] {
  return [
    `DROP TABLE IF EXISTS ${rangesTable(generation)}`,
    `DROP TABLE IF EXISTS ${locationsTable(generation)}`,
    `CREATE TABLE ${rangesTable(generation)} (s BLOB PRIMARY KEY, e BLOB NOT NULL, loc INTEGER NOT NULL) WITHOUT ROWID`,
    `CREATE TABLE ${locationsTable(generation)} (id INTEGER PRIMARY KEY, country TEXT NOT NULL, region TEXT NOT NULL, city TEXT NOT NULL, lat REAL NOT NULL, lon REAL NOT NULL)`,
  ];
}

export function dropTablesSql(generation: number): string[] {
  return [
    `DROP TABLE IF EXISTS ${rangesTable(generation)}`,
    `DROP TABLE IF EXISTS ${locationsTable(generation)}`,
  ];
}

const quote = (text: string) => `'${text.replaceAll("'", "''")}'`;
const RANGE_ROWS_PER_STATEMENT = 500;
const LOCATION_ROWS_PER_STATEMENT = 250;

/**
 * Insert statements for parsed ranges. Every value is a number, a hex blob
 * built here or a quoted, control-free string, so the SQL is inlined rather
 * than bound (D1 binds at most 100 values a statement). Retried steps write
 * the same rows again (`OR REPLACE` / `OR IGNORE`).
 */
export function insertSql(generation: number, ranges: GeoipRange[]): string[] {
  const statements: string[] = [];
  const locations = new Map<number, GeoipLocation>();
  const rows: string[] = [];
  for (const range of ranges) {
    const id = locationId(range.location);
    locations.set(id, range.location);
    rows.push(`(X'${keyHex(range.start)}',X'${keyHex(range.end)}',${id})`);
  }
  for (let i = 0; i < rows.length; i += RANGE_ROWS_PER_STATEMENT) {
    statements.push(
      `INSERT OR REPLACE INTO ${rangesTable(generation)} (s, e, loc) VALUES ${rows.slice(i, i + RANGE_ROWS_PER_STATEMENT).join(',')}`
    );
  }
  const locationRows = [...locations].map(
    ([id, l]) =>
      `(${id},${quote(l.country)},${quote(l.region)},${quote(l.city)},${l.lat},${l.lon})`
  );
  for (let i = 0; i < locationRows.length; i += LOCATION_ROWS_PER_STATEMENT) {
    statements.push(
      `INSERT OR IGNORE INTO ${locationsTable(generation)} (id, country, region, city, lat, lon) VALUES ${locationRows.slice(i, i + LOCATION_ROWS_PER_STATEMENT).join(',')}`
    );
  }
  return statements;
}

export function lookupSql(generation: number): string {
  return `SELECT r.e AS e, l.country AS country, l.region AS region, l.city AS city, l.lat AS lat, l.lon AS lon FROM ${rangesTable(generation)} r JOIN ${locationsTable(generation)} l ON l.id = r.loc WHERE r.s <= ? ORDER BY r.s DESC LIMIT 1`;
}

const NEWLINE = 10;

/**
 * The complete lines of a step: those starting in [offset, offset + length).
 * `bytes` is the file read from `max(0, offset - 1)` to past the chunk's end
 * (so the last line can be finished and a line start at `offset` is known).
 */
export function linesInChunk(
  bytes: Uint8Array,
  offset: number,
  length: number,
  /** The read reached the end of the file. */
  atEnd: boolean
): string[] {
  const base = Math.max(0, offset - 1);
  let position = 0;
  if (offset > 0) {
    // Byte offset-1 is '\n' when a line starts exactly at offset.
    const newline = bytes.indexOf(NEWLINE, 0);
    if (newline < 0) {
      return [];
    }
    position = newline + 1;
  }
  const decoder = new TextDecoder();
  const lines: string[] = [];
  while (position < bytes.length && base + position < offset + length) {
    const end = bytes.indexOf(NEWLINE, position);
    if (end < 0) {
      if (!atEnd) {
        throw new Error('A GeoIP line is longer than the read margin');
      }
      // The file's last line may have no trailing newline.
      lines.push(decoder.decode(bytes.subarray(position)));
      break;
    }
    lines.push(decoder.decode(bytes.subarray(position, end)));
    position = end + 1;
  }
  return lines.filter((line) => line.length > 0);
}
