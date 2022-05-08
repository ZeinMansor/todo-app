'user strict'

import express, { Request, Response} from "express";
import dotenv from "dotenv";
import connect from "./util/dbConnect" ;
import session from "express-session";
import passport from "passport";
import MongoStore from "connect-mongo";
import compression from "compression";
import { MONGODB_URI, SESSION_SECRET } from "./util/secret";
import { initPassport } from "./config/passport";
import { extractJWT } from "./util/jwt";
// import { upload } from "./util/multerConfig";


import * as userController from "./controllers/users.controller";
import * as todoController from "./controllers/todo.controller";

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

/**
 * @GET checkif the server is online
 */
app.get("/ping", (req: Request, res: Response) => {
  res.send("pong!~")
});


/**
 * @POST Primary Auth
 */

app.post("/auth/register", userController.postRegister);
app.post("/auth/login", userController.postLogin);




/**
 * @TODO Api
 */

app.post("/todo/new-todo", extractJWT, todoController.postNewTodo);
app.put("/todo/update-todo", extractJWT, todoController.updateTodo)
app.delete("/todo/delete-todo/:todoId", extractJWT, todoController.deletTodo);
app.get("/todo/get-todo/:todoId", extractJWT, todoController.getTodoById);

app.get("/todo/get-all-todos/:id", extractJWT, todoController.getAllTodos);
app.get("/todo/get-all-todos/", extractJWT, todoController.getAllTodos);

export default app;