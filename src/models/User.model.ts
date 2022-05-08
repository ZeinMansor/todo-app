'use strict'

import bcryptjs from "bcryptjs";
import mongoose from "mongoose";

export type UserDocument = mongoose.Document & {
  username: string;
  email: string;
  password: string;
  
  passwordResetCode: string;

  verified: boolean,

  tokens: AuthToken[];

  profile: {
    name: string;
    gender: string;
    picture: string;
    location: String;
  };

  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<Boolean>
  gravatar: (size: number) => string;
} 

export interface AuthToken {
  accessToken: string;
  kind: string;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    username: { type: String, unique: true},
    email: { type: String, unique: true, required: true },
    password: { type: String},
    passwordResetCode: String,
    

    verified: {
      type: Boolean,
      default: false
    },

    tokens: Array,

    profile: {
      name: {
        type: String,
        default: ''
      },
      picture: {
        type: String,
        default: ''
      },
      
      location: {
        type: String,
        default: ''
      },
    }
  },
  { 
    timestamps : true
  }
);


userSchema.methods.comparePassword = async function (candidatePassword: string) : Promise<Boolean> {
  const user = this as UserDocument;
  return bcryptjs.compare(candidatePassword, user.password).catch((e) => false);
}


export interface IUser {
  id: string;
  email: string;
  auth: string[];
}

export const User = mongoose.model<UserDocument>("user", userSchema);