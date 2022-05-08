'use strict'

import errorHandler from "errorhandler";
import app from "./app";
import log from "./util/logger";



if(process.env.NODE_ENV === "development") {
  app.use(errorHandler());
}


const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  log.info(`Connected on port ${port}`)
});