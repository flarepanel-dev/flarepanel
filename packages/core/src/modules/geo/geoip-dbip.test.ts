import { Database } from 'bun:sqlite';
import { describe, expect, it } from 'bun:test';
import {
  compareKeys,
  createTablesSql,
  insertSql,
  ipToKey,
  keyHex,
  linesInChunk,
  locationId,
  lookupSql,
  parseDbipLine,
} from './geoip-dbip';

const SAMPLE = [
  '1.0.0.0,1.0.0.255,OC,AU,Queensland,"South Brisbane",-27.4767,153.017',
  '1.0.1.0,1.0.3.255,AS,CN,Fujian,Wenquan,26.0998,119.297',
  '23.113.0.0,23.113.3.191,NA,US,California,"San Diego (Mid-City:City Heights)",32.7349,-117.097',
  '2001:200::,2001:200:ff:ffff:ffff:ffff:ffff:ffff,AS,JP,Tokyo,"Chiyoda, O\'Hara",35.6895,139.692',
  '2a00:1450::,2a00:1450:ffff:ffff:ffff:ffff:ffff:ffff,EU,DE,Berlin,Berlin,52.5244,13.4105',
];

describe('IP keys', () => {
  it('maps IPv4 into IPv6 space and parses compressed IPv6', () => {
    expect(keyHex(ipToKey('1.2.3.4') as Uint8Array)).toBe(
      '00000000000000000000ffff01020304'
    );
    expect(keyHex(ipToKey('::ffff:1.2.3.4') as Uint8Array)).toBe(
      '00000000000000000000ffff01020304'
    );
    expect(keyHex(ipToKey('2001:db8::1') as Uint8Array)).toBe(
      '20010db8000000000000000000000001'
    );
    expect(keyHex(ipToKey('::') as Uint8Array)).toBe('0'.repeat(32));
    for (const bad of [
      '1.2.3.256',
      '1::2::3',
      'hello',
      '1.2.3',
      '2001:db8::zz',
    ]) {
      expect([bad, ipToKey(bad)]).toEqual([bad, null]);
    }
    expect(
      compareKeys(
        ipToKey('1.0.0.9') as Uint8Array,
        ipToKey('1.0.1.0') as Uint8Array
      )
    ).toBeLessThan(0);
  });
});

describe('DB-IP lines', () => {
  it('parses quoted fields, including commas and quotes', () => {
    const range = parseDbipLine(SAMPLE[3] ?? '');
    expect(range?.location).toEqual({
      country: 'JP',
      region: 'Tokyo',
      city: "Chiyoda, O'Hara",
      lat: 35.6895,
      lon: 139.692,
    });
    expect(parseDbipLine('garbage')).toBeNull();
  });

  it('gives a location the same id in every step', () => {
    const a = parseDbipLine(SAMPLE[4] ?? '');
    const b = parseDbipLine(SAMPLE[4] ?? '');
    expect(locationId(a?.location as never)).toBe(
      locationId(b?.location as never)
    );
    expect(Number.isSafeInteger(locationId(a?.location as never))).toBe(true);
  });

  it('splits a file into steps without losing or repeating a line', () => {
    const file = new TextEncoder().encode(`${SAMPLE.join('\n')}\n`);
    for (const chunk of [7, 50, 100, 1000]) {
      const seen: string[] = [];
      for (let offset = 0; offset < file.length; offset += chunk) {
        const from = Math.max(0, offset - 1);
        const to = Math.min(file.length, offset + chunk + 400);
        seen.push(
          ...linesInChunk(
            file.subarray(from, to),
            offset,
            chunk,
            to === file.length
          )
        );
      }
      expect([chunk, seen]).toEqual([chunk, SAMPLE]);
    }
  });
});

describe('the generated SQL in SQLite', () => {
  it('loads ranges and finds the range holding an address', () => {
    const db = new Database(':memory:');
    for (const statement of createTablesSql(3)) {
      db.run(statement);
    }
    const ranges = SAMPLE.map((line) => parseDbipLine(line)).filter(
      (r) => r !== null
    );
    for (const statement of insertSql(3, ranges)) {
      db.run(statement);
    }
    // A retried step writes the same rows again.
    for (const statement of insertSql(3, ranges)) {
      db.run(statement);
    }
    const find = (ip: string) => {
      const key = ipToKey(ip) as Uint8Array;
      const row = db.query(lookupSql(3)).get(key) as {
        e: Uint8Array;
        city: string;
        country: string;
      } | null;
      return row && compareKeys(new Uint8Array(row.e), key) >= 0
        ? `${row.country}/${row.city}`
        : null;
    };
    expect(find('1.0.2.7')).toBe('CN/Wenquan');
    expect(find('23.113.3.191')).toBe('US/San Diego (Mid-City:City Heights)');
    expect(find('23.113.3.192')).toBeNull();
    expect(find('2a00:1450:4001::5')).toBe('DE/Berlin');
    expect(find('2001:200::abcd')).toBe("JP/Chiyoda, O'Hara");
    expect(
      (
        db.query('SELECT count(*) AS n FROM geo_ranges_3').get() as {
          n: number;
        }
      ).n
    ).toBe(5);
  });
});
