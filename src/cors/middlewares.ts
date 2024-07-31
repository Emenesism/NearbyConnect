import { NextFunction, Response, Request } from "express";
import { validateAdminJWT, validateClientJWT} from "./jwt";
import { getAdminByEmail } from "../controller/adminController";
import { AuthenticatedRequest } from "../interfaces/authenticatedRequest";
import { getRequestInfoByPhoneNumber } from "../controller/requstInfoController";

export const protectAdmin = async (
    req: AuthenticatedRequest,
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
  
    let user = validateAdminJWT(token);
    if (!user) {
      res.status(401);
      res.json({ message: "Not Authorized" });
      return;
    }
  
    let admin = await getAdminByEmail(user.email);
  
    if (!admin) {
      res.status(401);
      res.json({ message: "Not Authorized" });
      return;
    }
  
    req.user = {
      email : user.email ,
      phoneNumber : "0"
    };
    next();
  };
  


export const protectClient = async (
  req: AuthenticatedRequest,
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

  let requestInfo : any = await getRequestInfoByPhoneNumber(user.phoneNumber);

  if (!requestInfo) {
    res.status(401);
    res.json({ message: "Not Authorized" });
    return;
  }

  req.user = {
    email : "user.email" ,
    phoneNumber : String(user.phoneNumber)
  }
  next();
};