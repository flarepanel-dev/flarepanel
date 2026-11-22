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
