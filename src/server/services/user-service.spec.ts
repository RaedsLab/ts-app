import { expect } from "chai";
import { HttpStatusCode } from "../common/http-status-code";
import {
  testUserEmail,
  testUserName,
  createTestUser,
  testUserPassword,
} from "../../node/test/create-test-user";
import { expectError } from "../../node/test/expect-error";
import { expectOperationError } from "../test/expect-operation-error";
import { UserRepository } from "../../node/database/repositories/user-repository";
import { UserService } from "./user-service";
import { UserPasswordService } from "./user-password-service";

describe("UserService", () => {
  const service = new UserService();

  describe("getById", () => {
    it("should be able to get by id", async () => {
      const user = await createTestUser();

      const foundUser = await service.getById(user.id);
      expect(foundUser.email).to.equal(user.email);
    });

    it("should reject if user not found", async () => {
      const error = await expectError(() => service.getById(0));
      expectOperationError(error, "NOT_FOUND", HttpStatusCode.NOT_FOUND);
    });
  });

  describe("create", () => {
    it("should be able to create user", async () => {
      const user = await service.create({
        email: testUserEmail,
        name: testUserName,
      });

      expect(user.email).to.equal(testUserEmail);
    });

    it("should reject invalid email", async () => {
      const error = await expectError(() =>
        service.create({ email: "test1234", name: testUserName })
      );
      expectOperationError(error, "INVALID_EMAIL", HttpStatusCode.BAD_REQUEST);
    });

    it("should reject in use email", async () => {
      const user = await createTestUser();

      const error = await expectError(() =>
        service.create({ email: user.email, name: testUserName })
      );
      expectOperationError(error, "EMAIL_IN_USE", HttpStatusCode.BAD_REQUEST);
    });
  });

  describe("register", () => {
    it("should reject invalid email", async () => {
      const error = await expectError(() =>
        service.register({
          email: "blah",
          password: testUserPassword,
          name: testUserName,
        })
      );
      expectOperationError(error, "INVALID_EMAIL", HttpStatusCode.BAD_REQUEST);
    });

    it("should reject invalid password", async () => {
      const error = await expectError(() =>
        service.register({
          email: testUserEmail,
          name: testUserName,
          password: "hunter",
        })
      );
      expectOperationError(
        error,
        "INVALID_PASSWORD",
        HttpStatusCode.BAD_REQUEST
      );
    });

    it("should reject if email in use", async () => {
      await createTestUser();

      const error = await expectError(() =>
        service.register({
          email: testUserEmail,
          name: testUserName,
          password: "test1234",
        })
      );
      expectOperationError(error, "EMAIL_IN_USE", HttpStatusCode.BAD_REQUEST);
    });

    it("should have succeeded and have set password", async () => {
      const password = "test1234";
      await service.register({
        email: testUserEmail,
        name: testUserName,
        password,
      });

      const user = await new UserRepository().findOne({
        where: { email: testUserEmail },
      });
      if (!user) {
        throw new Error("expected user to be created");
      }

      if (
        !(await new UserPasswordService().isValidPassword(user.id, password))
      ) {
        throw new Error("expected password to be valid");
      }
    });
  });

  describe("update", () => {
    it("should reject without name", async () => {
      const user = await createTestUser();

      const err = await expectError(() =>
        service.update(user, {
          name: "",
        })
      );
      expectOperationError(
        err,
        "INVALID_PARAMETERS",
        HttpStatusCode.BAD_REQUEST
      );
    });

    it("should be able to update", async () => {
      const user = await createTestUser();
      const name = "Name_Chaned";

      const updatedUser = await service.update(user, {
        name,
      });
      expect(updatedUser.name).to.equal(name);
    });
  });
});
