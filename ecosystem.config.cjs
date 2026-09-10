/**
 * PM2 ecosystem config for Shree Shyam Rasoi
 * Usage:
 *   pm2 start ecosystem.config.cjs       -- start the app
 *   pm2 save                              -- save process list
 *   pm2 startup                           -- auto-start on boot
 */
module.exports = {
  apps: [
    {
      name: 'rasoi-server',
      script: 'server/index.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
