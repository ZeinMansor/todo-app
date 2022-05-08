'use strict';

import { NextFunction, Request, Response } from "express";
import { User, UserDocument, IUser } from "../models/User.model";
import { body, check, validationResult } from "express-validator";
import bcryptjs from "bcryptjs";
import { omit } from "lodash";
// import log from "../util/logger";
import { signJWT } from "../util/jwt";
import passport from "passport";
import { IVerifyOptions } from "passport-local";

export const postRegister = async (req: Request, res: Response) => {
  await check("username", "Username is required").notEmpty().run(req);
  await check("email", "Please enter a valid email email address").isEmail().notEmpty().run(req);
  await check("password", "Password must be at least 8 characters long").isLength({ min: 8 }).run(req);
  await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req);
  await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    res.status(400).json({ err: true, message: errors });
  }

  User.findOne({ email: req.body.email }, async (err: NativeError, existingUser: UserDocument) => {
    if (err) { 
      res.status(400).json({ err: true, message: err.message });
      return;
    }

    if (existingUser) {
      res.status(409).json({ err: true, message: `user with email ${req.body.email} already exists, try loging in instade` });
      return;
    }

    const salt = await bcryptjs.genSalt(12);
    const hashedPassword = await bcryptjs.hashSync(req.body.password, salt);

    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });

    user.save((err) => {
      if (err) { 
        res.status(300).json({ err: true, message: err.message });
        return;
      } else {

        const TUser: IUser = {
          id: user._id,
          email: user.email,
          auth: ['edit-profile']
        }
        signJWT(TUser, (err, token) => {
          if (err) {
            res.status(404).json({ err: true, message: err })
          } else {
            res.json({
              err: false,
              message: "Loged in Successfully",
              user: omit(user.toJSON(), "password"),
              token: token
            })
            return;
          }
        })
      }
    })
  })
}


export const postLogin = async (req: Request, res: Response, next: NextFunction) => {
  await check("email", "Please enter a valid email email address").isEmail().notEmpty().run(req);
  await check("password", "Password must be at least 8 characters long").isLength({ min: 8 }).run(req);
  await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    res.status(400).json({ err: true, message: errors });
  }


  passport.authenticate("local", (err: Error, user: UserDocument, info: IVerifyOptions) => {
    if (err) {
      res.status(302).json({ err: true, message: err });
      return;
    }
    if (!user) {
      res.status(400).json({ err: true, message: info.message })
      return;
    }
    req.logIn(user, (err) => {
      if (err) {
        res.status(400).json({ err: true, message: err });
        return;
      }
      const TUser: IUser = {
        id: user._id,
        email: user.email,
        auth: ['edit-profile']
      }
      signJWT(TUser, (err, token) => {
        if (err) {
          res.status(404).json({ err: true, message: err })
        } else {
          res.json({
            err: false,
            message: "Loged in Successfully",
            user: omit(user.toJSON(), "password"),
            token: token
          })
          return;
        }
      })
    })
  })(req, res, next);
}