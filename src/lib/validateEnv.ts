import { cleanEnv, port, str, num } from 'envalid';

const validateEnv = () => {
  cleanEnv(process.env, {
    // Server defaults
    NODE_ENV: str(),
    PORT: port(),

    // Crypto numbers
    EXEC_NUM: num(),
    RESULT_LENGTH: num(),
    SECRET_KEY: str(),

    // Database
    MONGO_URI: str(),
    MONGO_URI_ALONE: str(),
    REPLICA_SET_NAME: str(),

    // S3
    AWS_ACCESS_ID: str(),
    AWS_SECRET_KEY: str(),
    AWS_REGION: str(),
    AWS_THUMB_BUCKET: str(),
    AWS_DATA_BUCKET_NAME: str(),
    AWS_USERDATA_BUCKET_NAME: str(),

    // Mail
    AWS_SES_ID: str(),
    AWS_SES_SECRET: str(),
    AWS_SES_REGION: str(),
    MAIL_USER: str(),

    // Docker Env
    MONGO_INITDB_ROOT_USERNAME: str(),
    MONGO_INITDB_ROOT_PASSWORD: str(),
    MONGO_INITDB_DATABASE: str(),
    MONGO_TEST_DATABASE: str(),

    // Slack
    SLACK_WEBHOOK: str(),
  });
};

export default validateEnv;
