import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dotenvExpand from 'dotenv-expand';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { logger } from '../configs/winston';

dotenvExpand(dotenv.config());

mongoose.Promise = global.Promise;

export const memoryDb = new MongoMemoryServer();

export const dbConnOpts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: true,
};

export const connectDatabase = async () => {
  const dbEnvironment =
  process.env.NODE_ENV === 'test' ? await memoryDb.getUri() : process.env.MONGO_URI_ALONE;  

  if (process.env.NODE_ENV === 'development') {
    // enable logging collection methods + arguments to the console/file
    mongoose.set('debug', true);
  }

  mongoose
    .connect(dbEnvironment, dbConnOpts)
    .then(() => {
      logger.info(`***MongoDB for ${process.env.NODE_ENV} is connected***`);
    })
    .catch(error => {
      logger.error(`Unable to connect to database: ${error}`);
    });
};

export const dropDatabase = async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error(`Dropping database only allowed on test environment.`)
  }

  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  memoryDb.stop();
}
