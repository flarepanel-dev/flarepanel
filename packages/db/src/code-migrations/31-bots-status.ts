import { TABLE_NAMES } from '../clickhouse/client';
import {
  addColumns,
  runClickhouseMigrationCommands,
} from '../clickhouse/migration';
import { type CodeMigrationEnv, getIsCluster, writeSqlDump } from './helpers';

/**
 * Bot hits on a server install carry what the Cloudflare deployment keeps:
 * the response status and whether the edge verified the bot. The defaults
 * mean "not reported", so rows written before this migration read correctly.
 */
export async function up(env: CodeMigrationEnv) {
  const isClustered = getIsCluster(env);

  const sqls: string[] = addColumns(
    TABLE_NAMES.events_bots,
    [
      '`status` UInt16 DEFAULT 0',
      '`verified` Int8 DEFAULT -1',
      "`verified_category` LowCardinality(String) DEFAULT ''",
    ],
    isClustered
  );

  writeSqlDump(import.meta.url, sqls);

  if (!process.argv.includes('--dry')) {
    await runClickhouseMigrationCommands(sqls);
  }
}
