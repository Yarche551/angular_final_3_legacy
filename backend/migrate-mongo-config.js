
const config = require('./config');

const configMigrations = {
  mongodb: {
    url: config.db.dbUrl,
    databaseName: config.db.dbName,
    options: {},
  },
  moduleSystem: 'commonjs',
  migrationsDir: 'migrations',
  changelogCollectionName: 'migrations',
  migrationFileExtension: '.js',
  useFileHash: false,
};

module.exports = configMigrations;
