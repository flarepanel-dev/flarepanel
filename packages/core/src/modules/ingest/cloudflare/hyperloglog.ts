/* biome-ignore-all lint/suspicious/noBitwiseOperators: cyrb53 is defined in 32-bit integer arithmetic */

// Unique visitors per day in a fixed 4 KB: a HyperLogLog sketch with 2^12
// registers (about 1.6% standard error), the precision ClickHouse's
// `uniqHLL12` uses. Days merge by register-wise max, so any date range is
// counted from the daily sketches alone.

const PRECISION = 12;
export const HLL_REGISTERS = 2 ** PRECISION;
const INDEX_MASK = HLL_REGISTERS - 1;
/** Bits of the 53-bit hash left after the register index. */
const RANK_BITS = 53 - PRECISION;
const ALPHA = 0.7213 / (1 + 1.079 / HLL_REGISTERS);
const SMALL_RANGE_FACTOR = 2.5;
const SPARSE_MARKER = 0x01;
const SPARSE_ENTRY_BYTES = 3;

const HASH_SEED_A = 0xde_ad_be_ef;
const HASH_SEED_B = 0x41_c6_ce_57;
const HASH_MIX_A = 2_654_435_761;
const HASH_MIX_B = 1_597_334_677;
const HASH_FINAL_A = 2_246_822_507;
const HASH_FINAL_B = 3_266_489_909;
const HIGH_WORD = 4_294_967_296;
const LOW_WORD_MASK = 0x1f_ff_ff;

/** cyrb53: a fast 53-bit string hash with good avalanche. */
function hash53(value: string): number {
  let h1 = HASH_SEED_A;
  let h2 = HASH_SEED_B;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, HASH_MIX_A);
    h2 = Math.imul(h2 ^ code, HASH_MIX_B);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), HASH_FINAL_A);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), HASH_FINAL_B);
  h2 = Math.imul(h2 ^ (h2 >>> 16), HASH_FINAL_A);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), HASH_FINAL_B);
  return HIGH_WORD * (LOW_WORD_MASK & h2) + (h1 >>> 0);
}

function rank(rest: number): number {
  if (rest === 0) {
    return RANK_BITS + 1;
  }
  return RANK_BITS - Math.floor(Math.log2(rest));
}

export class HyperLogLog {
  readonly registers: Uint8Array;

  constructor(registers?: Uint8Array) {
    this.registers =
      registers?.length === HLL_REGISTERS
        ? registers
        : new Uint8Array(HLL_REGISTERS);
  }

  /** Returns whether the sketch changed. */
  add(value: string): boolean {
    const hash = hash53(value);
    const index = hash & INDEX_MASK;
    const registerRank = rank(Math.floor(hash / HLL_REGISTERS));
    if (registerRank <= (this.registers[index] ?? 0)) {
      return false;
    }
    this.registers[index] = registerRank;
    return true;
  }

  merge(other: HyperLogLog): void {
    for (let i = 0; i < HLL_REGISTERS; i++) {
      const theirs = other.registers[i] ?? 0;
      if (theirs > (this.registers[i] ?? 0)) {
        this.registers[i] = theirs;
      }
    }
  }

  /**
   * Storage form: the 4 KB registers, or, while few are set, a sparse list of
   * (index, value) triples behind a marker byte. Hourly sketches of a small
   * site are mostly empty, so this keeps a year of hours small. Dense input
   * is exactly 4096 bytes, so rows written before the sparse form still load.
   */
  toBytes(): Uint8Array {
    let used = 0;
    for (const register of this.registers) {
      if (register !== 0) {
        used += 1;
      }
    }
    if (used * SPARSE_ENTRY_BYTES + 1 >= HLL_REGISTERS) {
      return this.registers;
    }
    const out = new Uint8Array(1 + used * SPARSE_ENTRY_BYTES);
    out[0] = SPARSE_MARKER;
    let offset = 1;
    for (let index = 0; index < HLL_REGISTERS; index++) {
      const register = this.registers[index] ?? 0;
      if (register !== 0) {
        out[offset] = index >> 8;
        out[offset + 1] = index & 0xff;
        out[offset + 2] = register;
        offset += SPARSE_ENTRY_BYTES;
      }
    }
    return out;
  }

  static fromBytes(bytes: Uint8Array): HyperLogLog {
    if (bytes.length === HLL_REGISTERS) {
      return new HyperLogLog(bytes.slice());
    }
    const sketch = new HyperLogLog();
    if (bytes[0] !== SPARSE_MARKER) {
      return sketch;
    }
    for (
      let offset = 1;
      offset + SPARSE_ENTRY_BYTES <= bytes.length;
      offset += SPARSE_ENTRY_BYTES
    ) {
      const index = ((bytes[offset] ?? 0) << 8) | (bytes[offset + 1] ?? 0);
      if (index < HLL_REGISTERS) {
        sketch.registers[index] = bytes[offset + 2] ?? 0;
      }
    }
    return sketch;
  }

  count(): number {
    let sum = 0;
    let zeros = 0;
    for (const register of this.registers) {
      sum += 2 ** -register;
      if (register === 0) {
        zeros += 1;
      }
    }
    const estimate = (ALPHA * HLL_REGISTERS * HLL_REGISTERS) / sum;
    const isSmallRange = estimate <= SMALL_RANGE_FACTOR * HLL_REGISTERS;
    if (isSmallRange && zeros > 0) {
      return Math.round(HLL_REGISTERS * Math.log(HLL_REGISTERS / zeros));
    }
    return Math.round(estimate);
  }
}
