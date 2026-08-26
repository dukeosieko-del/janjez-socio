
module.exports = {

  apps: [{

    name: "janjez-app",

    script: "npm",

    args: "start",

    instances: 1,

    exec_mode: "fork",

    env: {

      NODE_ENV: "production",

      PORT: 3000,

      HOSTNAME: "0.0.0.0",

      NEXT_PUBLIC_SITE_URL: "https://staging.janjez.social",

    },

    log_date_format: "YYYY-MM-DD HH:mm:ss",

    error_file: "/var/log/pm2/janjez-app-error.log",

    out_file: "/var/log/pm2/janjez-app-out.log",

    combine_logs: true,

    max_restarts: 5,

    min_uptime: "30s",

  }],

};

