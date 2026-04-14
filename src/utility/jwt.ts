import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import { JwtPayload } from "../interfaces";

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: "24h" });
};


export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
};
