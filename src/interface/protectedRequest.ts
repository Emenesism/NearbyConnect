import { Request } from "express";

export interface protectedRequest extends Request {
  user: { email: string };
  email?: {
    email: string;
  };
}
