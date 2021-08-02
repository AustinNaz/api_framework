import { Request, Response, NextFunction } from "express";

export type resStruct = {
  status?: number;
  body: any;
  res: Response;
  next: NextFunction;
};

export type FuncResStruct = ({ status, body, res, next }: resStruct) => void;

export type ExpressMiddleware = {
  req: Request;
  res: Response;
  next: NextFunction;
};

export type FuncExpessMiddle = ({ req, res, next }: ExpressMiddleware) => any;

export const success: FuncResStruct = ({ status = 200, body, res, next }) => {
  res.status(status).send({ data: body });
  next();
};

export const failure: FuncResStruct = ({ status = 400, body, res, next }) => {
  res.status(status).send({ error: body });
  next(body);
};

export const parseReq: FuncExpessMiddle = ({ req, res, next }) => {
  let body;
  if (typeof req.body === "string") body = JSON.parse(req.body);
  else body = req.body;

  if (!body) failure({ res, next, body: "No body was supplied" });
  return body;
};
