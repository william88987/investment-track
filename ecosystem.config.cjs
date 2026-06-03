const path = require('path');
const fs = require('fs');

// Simple parser for server/.env file to preload env variables for PM2
// This ensures variables like PORT, DATABASE_PATH, etc. are passed correctly
const env = {
  NODE_ENV: 'production',
  PORT: 3002
};

const envPath = path.resolve(__dirname, 'server/.env');
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const index = trimmed.indexOf('=');
        if (index > 0) {
          const key = trimmed.substring(0, index).trim();
          let val = trimmed.substring(index + 1).trim();
          // Remove wrapping quotes if they exist
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
          }
          env[key] = val;
        }
      }
    });
  } catch (err) {
    console.error('Error reading server/.env file in ecosystem.config.cjs:', err);
  }
}

module.exports = {
  apps: [
    {
      name: 'investment-tracker-server',
      cwd: path.resolve(__dirname, './server'),
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: env,
      error_file: path.resolve(__dirname, './logs/pm2-error.log'),
      out_file: path.resolve(__dirname, './logs/pm2-out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true
    }
  ]
};
