import 'dotenv/config';

import app from './app';
import validateEnv from './lib/validateEnv';

validateEnv();

const PORT: number = parseInt(process.env.PORT, 10) || 3000;

app.listen(PORT);
