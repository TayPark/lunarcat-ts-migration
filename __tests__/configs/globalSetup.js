const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

const mongoose = require('mongoose');

const dbConnOpts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: true,
};

module.exports = async () => {
  dotenvExpand(dotenv.config());
  console.warn(process.env.MONGO_TEST_URI)
  const conn = await mongoose.createConnection(process.env.MONGO_TEST_URI, dbConnOpts);

  try {
    await conn.dropDatabase();
    console.log('Database dropped successfully');
  } catch (e) {
    console.error(`Fail to drop database: ${e} `)
    process.exit(1);
  }
};
