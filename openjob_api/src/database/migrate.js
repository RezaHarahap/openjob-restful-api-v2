require('dotenv').config();
const path = require('path');
const { spawnSync } = require('child_process');
const { runner } = require('node-pg-migrate');

const action = process.argv[2] || 'up';
const migrationsDir = path.join(__dirname, 'migrations');

// Keep the reviewer-recommended command available while ensuring generated
// files are written to the same directory used by the migration runner:
// npm run migrate create "create-table-example"
if (action === 'create') {
  const migrationName = process.argv.slice(3).join(' ').trim();
  if (!migrationName) {
    console.error('Migration name is required. Example: npm run migrate create "create-table-example"');
    process.exit(1);
  }

  const cliPath = require.resolve('node-pg-migrate/bin/node-pg-migrate');
  const result = spawnSync(
    process.execPath,
    [cliPath, 'create', migrationName, '--migrations-dir', migrationsDir],
    { stdio: 'inherit' },
  );
  process.exit(result.status ?? 1);
}

if (!['up', 'down'].includes(action)) {
  console.error(`Unknown migration action: ${action}. Use up, down, or create.`);
  process.exit(1);
}

runner({
  databaseUrl: {
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
  },
  dir: migrationsDir,
  direction: action,
  migrationsTable: 'pgmigrations',
  count: action === 'down' ? 1 : Infinity,
  log: console.log,
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
