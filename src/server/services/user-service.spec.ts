import { expect } from "chai";
import { HttpStatusCode } from "../common/http-status-code";
import {
  testUserEmail,
  testUserName,
  createTestUser,
} from "../../node/test/create-test-user";
import { expectError } from "../../node/test/expect-error";
import { expectOperationError } from "../test/expect-operation-error";
import { UserService } from "./user-service";

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
});
