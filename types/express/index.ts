import { Request, Response, NextFunction } from "express";

export type ResStruct = {
  status?: number;
  body: any;
  res: Response;
  next: NextFunction;
};

export type ExpressMiddleware = {
  req: Request;
  res: Response;
  next: NextFunction;
};