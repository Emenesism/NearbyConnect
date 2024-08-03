import { NextFunction, Response, Request } from "express";
import { validateClientJWT } from "./jwt";
import { protectedRequest } from "../interface/protectedRequest";
import { getUserByEmail } from "../controllers/users";

export const protectClient = async (
  req: protectedRequest,
  res: Response,
  next: NextFunction
) => {
  const bearer = req.headers.authorization;

  if (!bearer) {
    res.status(401);
    res.json({ message: "Not Authorized" });
    return;
  }

  const [, token] = bearer.split(" ");
  if (!token) {
    res.status(401);
    res.json({ message: "Not Authorized" });
    return;
  }

  let user = validateClientJWT(token);
  if (!user) {
    res.status(401);
    res.json({ message: "Not Authorized" });
    return;
  }

  let requestInfo : any = await getUserByEmail(user.email);

  if (!requestInfo) {
    res.status(401);
    res.json({ message: "Not Authorized" });
    return;
  }

  req.user = {
    email : user.email
  }
  next();
};