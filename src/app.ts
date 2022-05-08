'user strict'

import express, { Request, Response} from "express";
import dotenv from "dotenv";
import connect from "./util/dbConnect" ;
import session from "express-session";
import passport from "passport";
import MongoStore from "connect-mongo";
import compression from "compression";
import { MONGODB_URI, SESSION_SECRET } from "./util/secret";
import * as userController from "./controllers/users";
import { initPassport } from "./config/passport";
// import { upload } from "./util/multerConfig";

const app = express();
dotenv.config({ path: ".env" });

connect();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

const mongoUrl = MONGODB_URI;

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: SESSION_SECRET,
  store: new MongoStore({
    mongoUrl,
  })
}))

initPassport(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get("/ping", (req: Request, res: Response) => {
  res.send("pong!~")
});


/**
 * @POST Primary Auth
 */

app.post("/auth/register", userController.postRegister);
app.post("/auth/login", userController.postLogin);

export default app;