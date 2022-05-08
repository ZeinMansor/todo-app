'use strict'

import mongoose from "mongoose";
import { UserDocument } from "./User.model";

export type TodoDocument = mongoose.Document & {
  
  owner: UserDocument;

  title: string;

  notes: string[],

  attachment: string,
  
  dueDate: Date,
  
  createdAt: Date;
  updatedAt: Date;
  
} 
  
  
const todoSchema = new mongoose.Schema<TodoDocument>({

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },

  title: {
    type: String,
    default: ''
  },

  notes: Array,

  attachment: String,

  dueDate: Date,

}, { timestamps: true });


export const Todo = mongoose.model<TodoDocument>("todos", todoSchema)