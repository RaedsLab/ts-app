import { HttpStatusCode } from "./http-status-code";

export type OperationErrorMessage =
  | "UNKNOWN_ERROR"
  | "EMAIL_IN_USE"
  | "NOT_FOUND"
  | "INVALID_EMAIL"
  | "INVALID_PASSWORD"
  | "INVALID_TOKEN"
  | "INVALID_EMAIL_OR_PASSWORD"
  | "INVALID_PARAMETERS"
  | "EXPIRED_TOKEN";

export class OperationError extends Error {
  constructor(
    message: OperationErrorMessage,
    readonly status: HttpStatusCode,
    readonly info?: string
  ) {
    super(message);
  }
}
