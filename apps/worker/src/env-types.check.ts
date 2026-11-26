/**
 * Compile-time drift check between the hand-written `Env` (src/index.ts) and
 * the binding types `wrangler types` generates from wrangler.hosted.jsonc
 * into worker-configuration.d.ts (`bun run cf-typegen`).
 *
 * `Env` stays hand-written on purpose: self-hosters run without some
 * bindings (lite mode has no R2, no rate limiters, no geo tables), so those
 * are optional there while the generated types mark everything required.
 * `bun run typecheck` fails when a binding in the config is missing from
 * `Env`, or is declared with a type its runtime value does not fit.
 */
import type { Env } from './index';

type Generated = Cloudflare.Env;

/** Bindings only: vars and secrets are strings and read through config. */
type BindingKey = {
  [K in keyof Generated]: Generated[K] extends string ? never : K;
}[keyof Generated];

type MissingFromEnv = Exclude<BindingKey, keyof Env>;

type Shared = BindingKey & keyof Env;
type WrongType = {
  [K in Shared]: Generated[K] extends NonNullable<Env[K]> ? never : K;
}[Shared];

// A binding name in an error here is the one to add to or fix in `Env`.
export const everyBindingDeclared: [MissingFromEnv] extends [never]
  ? true
  : MissingFromEnv = true;
export const everyBindingTyped: [WrongType] extends [never] ? true : WrongType =
  true;
