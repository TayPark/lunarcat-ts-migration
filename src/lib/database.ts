import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dotenvExpand from 'dotenv-expand';
import { logger } from '../configs/winston';

dotenvExpand(dotenv.config());

mongoose.Promise = global.Promise;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};

const dbEnvironment =
  process.env.NODE_ENV === 'test' ? process.env.MONGO_TEST_URI : process.env.MONGO_URI_ALONE;

export const connectDatabase = () => {
  if (process.env.NODE_ENV !== 'production') {
    // enable logging collection methods + arguments to the console/file
    mongoose.set('debug', true);
  }

  mongoose
    .connect(dbEnvironment, options)
    .then(() => {
      logger.info('Database connected!');
    })
    .catch((error: Error) => {
      logger.error(`Unable to connect to database: ${error}`);
    });
};
