const mongoose = require('mongoose');
const config = require('./config');

async function connectDb() {
  await mongoose.connect(config.db.dbUrl, {
    dbName: config.db.dbName,
  });
  console.log(`MongoDB connected: ${config.db.dbUrl}/${config.db.dbName}`);
  return mongoose.connection;
}

module.exports = { connectDb, mongoose };
