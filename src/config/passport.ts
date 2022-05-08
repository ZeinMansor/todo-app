'use strict'

import passport from "passport";
import passportLocal from "passport-local";

import { User, UserDocument } from "../models/User.model";



const LocalStrategy = passportLocal.Strategy;

passport.serializeUser<any, any>((req, user, done) => {
    done(undefined, user);
});

passport.deserializeUser((id: any, done) => {
    User.findOne(id, (err: NativeError, user: UserDocument) => done(err, user))
})

/* Sign in with Email & Password */
export function initPassport(passport: any) {
    passport.use("local", new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
        User.findOne({ email: email }, async (err: NativeError, user: UserDocument) => {
            if (err) { return done(err.message) }
            if (!user) {
                return done(undefined, false, { message: `Email ${email} does not exist` })
            }
            if (await user.comparePassword(password)) {
                return done(undefined, user)
            } else {
                return done(undefined, false, { message: `Password incorrect` })
            }
        })
    }))
}