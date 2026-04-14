import pool from "../config/db";
import { UserModel, UserPublic } from "../models/user";

export const findUserByEmail = async (email: string): Promise<UserModel | null> => {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return rows[0] || null;
};

export const findUserById = async (id: string): Promise<UserPublic | null> => {
  const { rows } = await pool.query(
    "SELECT id, name, email, created_at FROM users WHERE id = $1",
    [id]
  );
  return rows[0] || null;
};

export const createUser = async (
  id: string,
  name: string,
  email: string,
  hashedPassword: string
): Promise<UserPublic> => {
  const { rows } = await pool.query(
    `INSERT INTO users (id, name, email, password)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, created_at`,
    [id, name, email, hashedPassword]
  );
  return rows[0];
};
