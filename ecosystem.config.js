module.exports = {
  apps: [
    {
      name: "line-call-notify",
      cwd: "/home/w00dst0ck/apps/line-call-notify",
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
