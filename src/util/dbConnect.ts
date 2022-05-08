'use strict'

import mongoose from 'mongoose'
import log from './logger';
import { MONGODB_URI } from './secret';

async function connect () {

    try {
    await mongoose.connect(MONGODB_URI!);
    log.info(`DB connected on ${MONGODB_URI}`);

  } catch (error) {
    log.error(error);
  }
}


export default connect