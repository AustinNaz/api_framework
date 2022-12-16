import { Request, Response, NextFunction } from "express";
export type Roles = "admin" | "manager" | "user";

export type Auth = {
  hasRole: Array<Roles>;
  allowSameUser?: boolean;
};

export type UserToken = {
  uid: string,
  role: string,
  email?: string
}

export type AuthProvider = {
  verifyIdToken: (token: string) => string | any;
};

export type AuthRoute = (req: Request, res: Response, next: NextFunction) => Promise<void>