'use strict';

require('dotenv').config()

import mongoose from 'mongoose'

mongoose.Promise = global.Promise;

const options = { 
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
  useCreateIndex: true 
}

class Database {
  constructor() {}
  
  async connect() {
    const dbEnvironment = process.env.NODE_ENV === 'test' ? process.env.MONGO_TEST_URI : process.env.MONGO_URI;
    
    try {
      await mongoose.connect(dbEnvironment, options)
      console.log('데이터베이스 연결 성공')
    } catch (e) {
      console.error(e)
    }
  }

  async disconnect() {
    if (mongoose.Connection.readyState !== 0) {
      try {
        await mongoose.disconnect();
        console.log('데이터베이스 연결 해제 성공')
      } catch (e) {
        console.error(e)
      }
    }
  }

  async drop() {
    try {
      await mongoose.Connection.dropDatabase()
      console.log(`Test database ${process.env.DB_TEST} is dropped`)
    } catch (e) {
      console.error(e)
    }
  }
}

module.exports = new Database()