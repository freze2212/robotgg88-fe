module.exports = {
  apps: [
    {
      name: 'tool-baccarat-v2-fe',
      script: 'npm',
      args: 'start',
      instances: 1,     
      exec_mode: "fork",        
      env: {
        NODE_ENV: 'production',
        PORT: 3210
      }
    }
  ]
};
