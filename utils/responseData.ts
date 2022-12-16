import { ResStruct } from "../types";

export const success = ({ status = 200, body, res, next }: ResStruct) => {
  res.status(status).send(body);
  next();
};

export const failure = ({ status = 400, body, res, next }: ResStruct) => {
  res.status(status).send({ error: body });
  next(body);
};

export const authFailure = ({ status = 401, body, res, next }: ResStruct) => {
  res.status(status).send({ error: body })
  next(body)
}
