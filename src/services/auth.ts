import { randomUUID } from "crypto";
import { findUserByEmail, createUser } from "../datalayer/user";
import { hashPassword, comparePassword } from "../utility/hash";
import { signToken } from "../utility/jwt";
import { throwServiceError } from "../helpers/service_helper";
import { AuthResponse } from "../interfaces";

export const registerUser = async (
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const existing = await findUserByEmail(email);
  if (existing) {
    throwServiceError(400, "validation failed", { email: "already in use" });
  }

  const hashed = await hashPassword(password);
  const user = await createUser(randomUUID(), name, email, hashed);
  const token = signToken({ user_id: user.id, email: user.email });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const user = await findUserByEmail(email);
  if (!user) throwServiceError(401, "unauthorized");

  const valid = await comparePassword(password, user!.password);
  if (!valid) throwServiceError(401, "unauthorized");

  const token = signToken({ user_id: user!.id, email: user!.email });
  return {
    token,
    user: { id: user!.id, name: user!.name, email: user!.email },
  };
};
