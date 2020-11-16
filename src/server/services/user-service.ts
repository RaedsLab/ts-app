import { PostgresError } from "../../node/database/postgres/postgres-error";
import { PostgresErrorCode } from "../../node/database/postgres/postgres-error-codes";
import { UserRepository } from "../../node/database/repositories/user-repository";
import { HttpStatusCode } from "../common/http-status-code";
import { OperationError } from "../common/operation-error";
import { isValidEmail } from "../../common/validation/is-valid-email";
import { validatePasswordRequirements } from "../../common/validation/validate-password-requirements";
import { log } from "../../node/utils/log";
import { IUser } from "../../node/database/entities/user";
import { AuthenticationService } from "./authentication-service";
import { UserPasswordService } from "./user-password-service";

export interface IUserCreateParams {
  email: string;
  name: string;
}

export interface IUserRegisterParams {
  email: string;
  name: string;
  password: string;
}

export interface IUpdateUserParams {
  name: string;
}

export class UserService {
  async getById(id: number) {
    const result = await this.repository.findOne({
      where: {
        id,
      },
    });
    if (!result) {
      throw new OperationError("NOT_FOUND", HttpStatusCode.NOT_FOUND);
    }

    return result;
  }

  async create({ email, name }: IUserCreateParams) {
    this.validateEmail(email);

    try {
      return await this.repository.create({
        email,
        name,
      });
    } catch (err) {
      if (
        err instanceof PostgresError &&
        err.code === PostgresErrorCode.UNIQUE_VIOLATION
      ) {
        throw new OperationError("EMAIL_IN_USE", HttpStatusCode.BAD_REQUEST);
      }

      throw err;
    }
  }

  async register({ email, password, name }: IUserRegisterParams) {
    const passwordValidation = validatePasswordRequirements(password);
    if (!passwordValidation.success) {
      throw new OperationError(
        "INVALID_PASSWORD",
        HttpStatusCode.BAD_REQUEST,
        passwordValidation.error
      );
    }

    const user = await this.create({ email, name });
    await this.passwordService.setPassword({ userId: user.id, password });

    return new AuthenticationService().login({
      email,
      password,
    });
  }

  async update(user: IUser, { name }: IUpdateUserParams) {
    this.validateUpdate(name);

    try {
      return await this.repository.update({
        ...user,
        name,
      });
    } catch (err) {
      log.error(err.message);

      throw err;
    }
  }

  private validateUpdate(name: string) {
    if (!name) {
      throw new OperationError(
        "INVALID_PARAMETERS",
        HttpStatusCode.BAD_REQUEST,
        "name must have a value."
      );
    }
  }

  private validateEmail(email: string) {
    if (!isValidEmail(email)) {
      throw new OperationError("INVALID_EMAIL", HttpStatusCode.BAD_REQUEST);
    }
  }

  private get repository() {
    return new UserRepository();
  }

  private get passwordService() {
    return new UserPasswordService();
  }
}
