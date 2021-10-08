import { ResStruct, ExpressMiddleware } from "../types";

export const success = ({ status = 200, body, res, next }: ResStruct) => {
  res.status(status).send(body);
  next();
};

export const failure = ({ status = 400, body, res, next }: ResStruct) => {
  res.status(status).send({ error: body });
  next(body);
};

export const parseReq = ({ req, res, next }: ExpressMiddleware) => {
  let body;
  if (typeof req.body === "string") body = JSON.parse(req.body);
  else body = req.body;

  if (!body) failure({ res, next, body: "No body was supplied" });
  return body;
};
