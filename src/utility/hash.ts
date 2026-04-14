import bcrypt from "bcrypt";
import { ENV } from "../config/env";

export const hashPassword = async (plain: string): Promise<string> => {
  return bcrypt.hash(plain, ENV.BCRYPT_ROUNDS);
};

export const comparePassword = async (
  plain: string,
  hashed: string
): Promise<boolean> => {
  return bcrypt.compare(plain, hashed);
};
