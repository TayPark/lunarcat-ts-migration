const { dropDatabase, connectDatabase } = require('../../src/lib/database')

/**
 * This is an async function that calls when all test cases ended. 
 * But we use memory database for testing, don't need to drop database on every try
 */
module.exports = async () => {
  await connectDatabase();
  await dropDatabase();
  process.exit(0);
};
