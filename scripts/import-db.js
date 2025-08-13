const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Database connection details for the new database
const DB_URL = 'postgresql://postgres:LlAzfykCrxhNjYOkoZJRCYpanyOwAhEK@turntable.proxy.rlwy.net:56272/railway';

// Parse the database URL
const url = new URL(DB_URL);
const host = url.hostname;
const port = url.port;
const database = url.pathname.slice(1); // Remove leading slash
const username = url.username;
const password = url.password;

// Get dump file from command line argument or use default
const dumpFile = process.argv[2] || path.join(__dirname, '..', 'prod_dump.dump');

if (!fs.existsSync(dumpFile)) {
  console.error(`❌ Dump file not found: ${dumpFile}`);
  console.error('Usage: node scripts/import-db.js [path-to-dump-file]');
  console.error('Example: node scripts/import-db.js ./backups/backup-2024-01-15.sql');
  process.exit(1);
}

// Set environment variable for password
process.env.PGPASSWORD = password;

// Build pg_restore command to import the dump
const pgRestoreCommand = `pg_restore -h ${host} -p ${port} -U ${username} -d ${database} --no-password --clean --if-exists "${dumpFile}"`;

console.log('Starting database import...');
console.log(`Host: ${host}`);
console.log(`Port: ${port}`);
console.log(`Database: ${database}`);
console.log(`Dump file: ${dumpFile}`);

// Execute the import command
exec(pgRestoreCommand, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Import failed:', error);
    return;
  }
  
  if (stderr) {
    console.log('psql stderr:', stderr);
  }
  
  if (stdout) {
    console.log('psql stdout:', stdout);
  }
  
  console.log('✅ Database import completed successfully!');
  console.log(`📁 Imported from: ${dumpFile}`);
});
