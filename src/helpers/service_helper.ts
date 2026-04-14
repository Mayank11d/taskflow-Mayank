import { ServiceError } from "../interfaces";

export const throwServiceError = (
  statusCode: number,
  message: string,
  fields?: Record<string, string>
): never => {
  const err: ServiceError = { statusCode, message, fields };
  throw err;
};

export const isServiceError = (err: unknown): err is ServiceError => {
  return (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    "message" in err
  );
};
