#!/usr/bin/env bun

/**
 * This repository is public: everything pushed here can be read, cloned and
 * archived by anyone, forever. This check stops commits that carry secrets,
 * personal data or internal notes before they leave the machine.
 *
 *   bun tooling/scripts/public-check.ts --staged          # what you are about to commit
 *   bun tooling/scripts/public-check.ts --range A..B      # commits about to be pushed
 *   bun tooling/scripts/public-check.ts                   # commits not on any remote yet
 *
 * It checks:
 * 1. Commit identities: author, committer and Co-authored-by emails must be a
 *    project or GitHub noreply address (add more with PUBLIC_CHECK_EMAILS;
 *    CI skips this with PUBLIC_CHECK_SKIP_IDENTITY for outside contributors).
 * 2. File paths: env files, keys, local state and internal notes never go in.
 * 3. Added lines and commit messages: personal email providers, absolute home
 *    paths, private keys, and every pattern in the local denylist.
 * 4. Large files (over 5 MB).
 * 5. Secrets, with gitleaks when it is installed (CI always runs it).
 *
 * The denylist is a plain file outside the repository, one regular
 * expression per line (`#` starts a comment), at
 * `$(git rev-parse --git-common-dir)/public-denylist`. Put names, private
 * emails, customer and other project names there: listing them in this
 * public file would publish them.
 *
 * A line that must contain a flagged pattern can end with
 * `public-check: allow`. Use it rarely and say why next to it.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ALLOWED_EMAILS = [
  /^hello@flarepanel\.dev$/i,
  /@users\.noreply\.github\.com$/i,
  /^noreply@github\.com$/i,
  ...(process.env.PUBLIC_CHECK_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)
    .map(
      (e) => new RegExp(`^${e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    ),
];

const FORBIDDEN_PATHS: [RegExp, string][] = [
  [/(^|\/)\.env(\.(?!example$)[^/]*)?$/, 'environment file'],
  [/(^|\/)\.dev\.vars(\.(?!example$)[^/]*)?$/, 'Wrangler local secrets'],
  [/\.(pem|key|p12|pfx|keystore)$/i, 'private key or certificate'],
  [/(^|\/)id_(rsa|ed25519|ecdsa)(\.pub)?$/, 'SSH key'],
  [/(^|\/)\.wrangler\//, 'local Wrangler state'],
  [/(^|\/)WORKTREE\.md$/, 'local worktree notes'],
  [/^docs\/(roadmap|internal|private)\//, 'internal planning notes'],
  [
    /(^|\/)[^/]*(isolation|pentest|attack)-report[^/]*\.md$/i,
    'security test report',
  ],
  [/\.(sqlite|db)(-wal|-shm)?$/, 'local database file'],
  [/\.(har|dump)$/i, 'network or memory dump'],
];

const ALWAYS_FLAG: [RegExp, string][] = [
  [
    /[A-Za-z0-9._%+-]+@(gmail|googlemail|proton|protonmail|pm|outlook|hotmail|live|icloud|me|yahoo|yandex|gmx|aol)\.[a-z.]{2,6}\b/i,
    'personal email address',
  ],
  [
    /\/(Users|home)\/[a-z][a-z0-9._-]+\//,
    'absolute home path (leaks a user name)',
  ],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key'],
  [/\b(sk|rk)_live_[0-9a-zA-Z]{10,}/, 'live API key'],
  [/\bgh[pousr]_[0-9A-Za-z]{30,}/, 'GitHub token'],
  [/\bgithub_pat_[0-9A-Za-z_]{30,}/, 'GitHub token'],
];

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOW_MARK = 'public-check: allow';

function git(args: string[], allowFail = false): string {
  const res = spawnSync('git', args, {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  if (res.status !== 0 && !allowFail) {
    throw new Error(`git ${args.join(' ')} failed: ${res.stderr}`);
  }
  return res.stdout ?? '';
}

function loadDenylist(): RegExp[] {
  const file = join(
    git(['rev-parse', '--git-common-dir']).trim(),
    'public-denylist'
  );
  if (!existsSync(file)) {
    return [];
  }
  return readFileSync(file, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => new RegExp(line, 'i'));
}

interface Problem {
  where: string;
  what: string;
}

function checkText(
  text: string,
  where: string,
  denylist: RegExp[],
  problems: Problem[]
) {
  if (text.includes(ALLOW_MARK)) {
    return;
  }
  for (const [pattern, label] of ALWAYS_FLAG) {
    if (pattern.test(text)) {
      problems.push({ where, what: label });
    }
  }
  denylist.forEach((pattern, index) => {
    if (pattern.test(text)) {
      // The pattern itself is private, so only its line number is shown.
      problems.push({
        where,
        what: `private term (denylist line ${index + 1})`,
      });
    }
  });
}

function checkPath(path: string, problems: Problem[]) {
  for (const [pattern, label] of FORBIDDEN_PATHS) {
    if (pattern.test(path)) {
      problems.push({ where: path, what: `${label} must not be committed` });
    }
  }
}

/** Added lines of a unified diff, with their file and new line number. */
function* addedLines(
  diff: string
): Generator<{ file: string; line: number; text: string }> {
  let file = '';
  let line = 0;
  for (const raw of diff.split('\n')) {
    if (raw.startsWith('+++ ')) {
      file = raw.slice(4).replace(/^b\//, '');
    } else if (raw.startsWith('@@')) {
      const m = /\+(\d+)/.exec(raw);
      line = m ? Number(m[1]) : 0;
    } else if (raw.startsWith('+') && !raw.startsWith('+++')) {
      yield { file, line, text: raw.slice(1) };
      line++;
    } else if (!raw.startsWith('-')) {
      line++;
    }
  }
}

function checkEmails(sha: string, problems: Problem[]) {
  // CI sets this: outside contributors sign with their own address, which is
  // their choice. The check guards our own commits, from the pre-push hook.
  if (process.env.PUBLIC_CHECK_SKIP_IDENTITY) {
    return;
  }
  const [author, committer, body] = git([
    'show',
    '-s',
    '--format=%ae%x00%ce%x00%B',
    sha,
  ]).split('\0');
  const coAuthors = [
    ...(body ?? '').matchAll(/^Co-authored-by:.*<([^>]+)>/gim),
  ].map((m) => m[1] as string);
  for (const email of [author, committer, ...coAuthors]) {
    const value = (email ?? '').trim();
    if (value && !ALLOWED_EMAILS.some((re) => re.test(value))) {
      problems.push({
        where: `commit ${sha.slice(0, 8)}`,
        what: `identity "${value}" is not a project or noreply address (set git config user.email)`,
      });
    }
  }
}

function runGitleaks(args: string[], problems: Problem[]) {
  const which = spawnSync('gitleaks', ['version'], { encoding: 'utf8' });
  if (which.status !== 0) {
    console.warn(
      'public-check: gitleaks is not installed; CI will scan for secrets.'
    );
    return;
  }
  const res = spawnSync(
    'gitleaks',
    [
      ...args,
      '--redact',
      '--verbose',
      '--no-banner',
      '--log-level',
      'error',
      '--exit-code',
      '3',
    ],
    { encoding: 'utf8' }
  );
  if (res.status === 3) {
    problems.push({
      where: 'gitleaks',
      what: `possible secret:\n${res.stdout}${res.stderr}`,
    });
  }
}

function main() {
  const argv = process.argv.slice(2);
  const staged = argv.includes('--staged');
  const rangeIndex = argv.indexOf('--range');
  const range = rangeIndex >= 0 ? argv[rangeIndex + 1] : undefined;
  const denylist = loadDenylist();
  const problems: Problem[] = [];

  if (staged) {
    for (const path of git([
      'diff',
      '--cached',
      '--name-only',
      '--diff-filter=ACMR',
    ])
      .split('\n')
      .filter(Boolean)) {
      checkPath(path, problems);
      const size = Number(
        git(['cat-file', '-s', `:${path}`], true).trim() || 0
      );
      if (size > MAX_FILE_BYTES) {
        problems.push({
          where: path,
          what: `large file (${(size / 1_048_576).toFixed(1)} MB)`,
        });
      }
    }
    for (const { file, line, text } of addedLines(
      git(['diff', '--cached', '-U0', '--no-color'])
    )) {
      checkText(text, `${file}:${line}`, denylist, problems);
    }
    runGitleaks(['git', '--staged', '.'], problems);
  } else {
    // A new branch: only its commits that no remote has yet.
    const newBranch = argv.includes('--new-branch');
    const commits = (
      range && !newBranch
        ? git(['rev-list', range])
        : git(['rev-list', range ?? 'HEAD', '--not', '--remotes'])
    )
      .split('\n')
      .filter(Boolean);
    for (const sha of commits) {
      checkEmails(sha, problems);
      checkText(
        git(['show', '-s', '--format=%B', sha]),
        `message of ${sha.slice(0, 8)}`,
        denylist,
        problems
      );
      for (const path of git([
        'diff-tree',
        '--no-commit-id',
        '-r',
        '--name-only',
        '--diff-filter=ACMR',
        '--root',
        sha,
      ])
        .split('\n')
        .filter(Boolean)) {
        checkPath(path, problems);
      }
      const diff = git([
        'show',
        '--format=',
        '-U0',
        '--no-color',
        '--diff-filter=ACMR',
        sha,
      ]);
      for (const { file, line, text } of addedLines(diff)) {
        checkText(
          text,
          `${file}:${line} (${sha.slice(0, 8)})`,
          denylist,
          problems
        );
      }
      for (const entry of git(['ls-tree', '-r', '-l', sha])
        .split('\n')
        .filter(Boolean)) {
        // "<mode> blob <sha> <size>\t<path>": only files this commit touched.
        const [meta, path] = entry.split('\t');
        const size = Number(meta?.trim().split(/\s+/)[3] ?? 0);
        if (size > MAX_FILE_BYTES && diff.includes(`b/${path}`)) {
          problems.push({
            where: `${path} (${sha.slice(0, 8)})`,
            what: `large file (${(size / 1_048_576).toFixed(1)} MB)`,
          });
        }
      }
    }
    if (commits.length > 0) {
      runGitleaks(
        [
          'git',
          '--log-opts',
          range && !newBranch ? range : `${commits[0]} --not --remotes`,
          '.',
        ],
        problems
      );
    }
    console.log(`public-check: ${commits.length} commit(s) checked.`);
  }

  if (problems.length > 0) {
    console.error(
      '\npublic-check: this would publish something that must stay private:\n'
    );
    for (const p of problems) {
      console.error(`  ✗ ${p.where}: ${p.what}`);
    }
    console.error(
      '\nThe repository is public. Remove it (amend or rewrite the commit before pushing),\n' +
        'move internal notes outside the repo, and rotate any secret that was committed.\n'
    );
    process.exit(1);
  }
  if (denylist.length === 0) {
    console.warn(
      'public-check: no local denylist found (see the comment at the top of this script).'
    );
  }
  console.log('public-check: nothing private found.');
}

main();
