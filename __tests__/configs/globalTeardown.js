const { dropDatabase } = require('../../src/lib/database')

module.exports = async () => {
  await dropDatabase();
  process.exit(0);
};
