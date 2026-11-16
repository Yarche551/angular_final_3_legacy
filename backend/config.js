const config = {
  secret: process.env.SESSION_SECRET || 'izi-dev-secret',
  env: process.env.ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:8080',
  db: {
    dbUrl: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017',
    dbName: process.env.MONGO_DB || 'izi',
    dbHost: 'localhost',
    dbPort: 27017,
  },
};

module.exports = config;
