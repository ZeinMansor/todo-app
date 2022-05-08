'user strict'

import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { Todo, TodoDocument } from "../models/Todo.model"





/**
 * 
 * @POST /todo/new-todo
 */

export const postNewTodo = async (req: Request, res: Response) => {

  await check("title", "Todo item must have a title").notEmpty().run(req);
  await check("notes", "A todo itme should have atleast one note").notEmpty().run(req);

  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    res.status(400).json({ err: true, message: errors });
    return;
  }


  const jwt = res.locals.jwt;

  const date = new Date(new Date().getTime() + ((req.body.duration ? parseInt(req.body.duration) : 1) * 24 * 60 * 60 * 1000));

  const todo = new Todo({
    owner: jwt.id,
    title: req.body.title,
    notes: req.body.notes,
    attachment: '',
    dueDate: date // 24h default duration
  })

  todo.save((err) => {
    if (err) {
      res.status(400).json({ err: true, message: err });
      return;
    }

    res.status(200).json({ err: false, message: "todo added successfully", todo: todo })
    return;
  })
}


/**
 * @PUT /todo/update-todo
 */

export const updateTodo = async (req: Request, res: Response) => {
  
  await check("todoId", "Specify the wanted todo id").notEmpty().run(req);

  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    res.status(400).json({ err: true, message: errors });
    return;
  }
  
  const date = new Date(new Date().getTime() + ((req.body.duration ? parseInt(req.body.duration) : 1) * 24 * 60 * 60 * 1000));

  Todo.findById(req.body.todoId, (err: any, existingTodo: TodoDocument) => {
    if(err) {
      res.status(400).json({ err: true, message: err });
      return ;
    }

    if (!existingTodo) {
      res.status(404).json({ err: true, message: "todo with specified id does not exist" });
      return;
    }

    existingTodo.title = req.body.title ? req.body.title : existingTodo.title;
    existingTodo.notes = req.body.notes ? req.body.notes : existingTodo.notes;
    existingTodo.attachment = '';
    existingTodo.dueDate = req.body.duration ? date : existingTodo.dueDate; // keep the old time or calulate a new due date

    existingTodo.save((error) => {
      if (error) {
        res.status(400).json({ err: true, message: error });
        return ;
      }

      res.status(200).json({ err: false, message: "todo updated successfully", todo: existingTodo })
      return;
    })
  });
}


/**
 * @DELETE /todo/delete-todo/:todoId
 */

export const deletTodo = async (req: Request, res: Response) => {
  
  const todId = req.params.todoId
  
  if(!todId) {
    res.status(400).json({ err: true, message: "Must specify todo id int the request parameter" });
  }
  

  const jwt = res.locals.jwt;
  
  Todo.findById(todId, (err: any, existingTodo: TodoDocument) => {
    if(err) {
      res.status(400).json({ err: true, message: err });
      return ;
    }

    if (!existingTodo) {
      res.status(404).json({ err: true, message: "todo with specified id does not exist" });
      return;
    }

    if (jwt.id != existingTodo.owner) {
      res.status(404).json({ err: true, message: "Unauthorized, you are not the owner of this todo item" });
      return;
    }

    existingTodo.save((error) => {
      if (error) {
        res.status(400).json({ err: true, message: error });
        return ;
      }

      res.status(200).json({ err: false, message: "todo deleted successfully"})
      return;
    })
  })
}

/**
 * @GET /todo/get-todo/:todoId
 */

export const getTodoById = async (req: Request, res: Response) => {
  
  const todId = req.params.todoId
  
  if(!todId) {
    res.status(400).json({ err: true, message: "Must specify todo id int the request parameter" });
  }

  const jwt = res.locals.jwt;
  
  Todo.findById(todId, (err: any, existingTodo: TodoDocument) => {
    if(err) {
      res.status(400).json({ err: true, message: err });
      return ;
    }

    if (!existingTodo) {
      res.status(404).json({ err: true, message: "todo with specified id does not exist" });
      return;
    }

    if (jwt.id != existingTodo.owner) {
      res.status(404).json({ err: true, message: "Unauthorized, you are not the owner of this todo item" });
      return;
    }

    res.status(200).json({ err: false, todo: existingTodo })
  })
}


/**
 * @GET /todo/get-all-todos/:id
 */

 export const getAllTodos = async (req: Request, res: Response) => {

  const userId = req.params.id;

  if (!userId) {
    res.status(300).json({ err: true, message: "Please spceify a userid" });
      return ;
  }

  Todo.find({ owner: userId }, (err: any, userTodos: TodoDocument) => {
    if(err) {
      res.status(400).json({ err: true, message: err });
      return ;
    }

    if (!userTodos) {
      res.status(200).json({ err: true, message: "There is no todos for this user" });
      return;
    }

    res.status(200).json({ err: false, todo: userTodos })
  })
}