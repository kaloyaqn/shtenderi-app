const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Database connection details
const DB_URL = 'postgresql://postgres:LlAzfykCrxhNjYOkoZJRCYpanyOwAhEK@turntable.proxy.rlwy.net:56272/railway';

// Parse the database URL
const url = new URL(DB_URL);
const host = url.hostname;
const port = url.port;
const database = url.pathname.slice(1); // Remove leading slash
const username = url.username;
const password = url.password;

// Create backup directory if it doesn't exist
const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Generate timestamp for filename
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

// Set environment variable for password
process.env.PGPASSWORD = password;

// Build pg_dump command
const pgDumpCommand = `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} --no-password --verbose --clean --if-exists --no-owner --no-privileges > "${backupFile}"`;

console.log('Starting database backup...');
console.log(`Host: ${host}`);
console.log(`Port: ${port}`);
console.log(`Database: ${database}`);
console.log(`Backup file: ${backupFile}`);

// Execute the backup command
exec(pgDumpCommand, (error, stdout, stderr) => {
  if (error) {
    console.error('Backup failed:', error);
    return;
  }
  
  if (stderr) {
    console.log('pg_dump stderr:', stderr);
  }
  
  console.log('✅ Database backup completed successfully!');
  console.log(`📁 Backup saved to: ${backupFile}`);
  
  // Get file size
  const stats = fs.statSync(backupFile);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`📊 Backup size: ${fileSizeInMB} MB`);
});
