import { Request, Response, NextFunction } from "express";
import { sign, SignOptions, verify, VerifyOptions } from  "jsonwebtoken";
import log from "./logger";
import { IUser } from "../models/User.model";

export const signJWT = (user: IUser, callback: (error: Error | null, token: string | null) => void): void => {
  const timeSinceEpoch = new Date().getTime();
  const expirationTime = (Number(process.env.SERVER_TOKEN_EXPIRETIME) + timeSinceEpoch) * 100000;
  const expirationTimeInSeconds = Math.floor(expirationTime / 1000);
  
  try {
    sign({ id: user.id, email: user.email, auth: user.auth }, process.env.SERVER_TOKEN_SECRET!, {
      issuer: process.env.SERVER_TOKEN_ISSUER,
      algorithm: 'HS256',
      expiresIn: expirationTimeInSeconds
    }, (error, token) => {
      if(error) {
        callback(error, null)
      } else if (token) {
        callback(null, token)
      }
    })
  } catch (err: Error | any) {
    log.error(err)
    callback(err, null)
  }
}

export const extractJWT = (req: Request, res: Response, next: NextFunction) => {

  let token = req.headers.authorization?.split(' ')[1];

  if(token) {
    let secret = process.env.SERVER_TOKEN_SECRET!
    verify(token, secret, (error, decoded) => {
      if (error) {
        res.status(401).json({ err: true, message: error })
      } else {
        res.locals.jwt = decoded;
        next();
      }
    })
  } else {
    res.status(500).json({ err: true, message: "unauthorized" })
  }
}


