const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const mongoose = require('mongoose');

const { dbConnOpts, memoryDb } = require('../../src/lib/database')

module.exports = async () => {
  dotenvExpand(dotenv.config());
  const conn = await mongoose.createConnection(await memoryDb.getUri(), dbConnOpts);

  try {
    await conn.dropDatabase();
    console.log('● Database dropped successfully');
  } catch (e) {
    console.error(`Fail to drop database: ${e} `)
    process.exit(1);
  }
};
