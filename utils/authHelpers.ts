import { Request, Response, NextFunction } from "express";
import { DecodedIdToken } from "firebase-admin/auth";
import { UserToken, Auth, Roles, AuthProvider } from "../types";

const authRoute =
  (auth: AuthProvider) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { authFailure } = req;
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) throw new Error("Auth Failed");
      const authToken = authHeader.split(" ")[1];

      const { uid, role, email }: DecodedIdToken = await auth.verifyIdToken(
        authToken
      );
      const userToken: UserToken = { uid, role, email };
      req.userToken = userToken;

      next();
    } catch (e) {
      console.log(e);
      console.log("auth", req.headers.authorization);
      const err = new Error("Could not Authenticate User.");
      authFailure({ body: err.message, res, next });
    }
  };

const isAuthorized =
  (opts: Auth) => (req: Request, res: Response, next: NextFunction) => {
    const { userToken, authFailure } = req;

    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !userToken) throw new Error("Missing Auth Creds");
      const { uid, role, email } = userToken;

      // Checking if uid === userId seems counterproductive since uid comes from usertoken thats already
      // decoded from the authHeader, so checking the userId from the authHeader against it would always be the same
      // Add some fail safe so that in the route itself a user cant edit other uids if allowSameUser is allowed
      // if (opts.allowSameUser && userId && uid === userId) return next()
      if (opts.allowSameUser && uid) return next();

      if (!role) throw new Error("Does not have role");

      if (opts.hasRole.includes(role as Roles)) return next();

      throw new Error("Auth Failed");
    } catch (e) {
      console.log(e);
      const err = new Error(
        "User Could not be Authenticated or Does not have access to this route."
      );
      authFailure({ body: err.message, res, next });
    }
  };

export { authRoute, isAuthorized };
