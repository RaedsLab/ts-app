import { expect } from "chai";
import { DateTime } from "luxon";
import { VerificationTokenRepository } from "../../node/database/repositories/verification-token-repository";
import { createTestUser } from "../../node/test/create-test-user";
import { expectError } from "../../node/test/expect-error";
import { HttpStatusCode } from "../common/http-status-code";
import { expectOperationError } from "../test/expect-operation-error";
import { VerificationTokenService } from "./verification-token-service";

describe("VerificationTokenService", () => {
  const service = new VerificationTokenService();

  const createValidToken = async () => {
    const user = await createTestUser();

    return service.create({
      type: "reset_password",
      userId: user.id,
    });
  };

  describe("create", () => {
    it("should create a valid token", async () => {
      const token = await createValidToken();
      expect(token.consumed).to.equal(false);
      expect(token.value.length).to.be.greaterThan(40);
      expect(token.type).to.equal("reset_password");
      expect(DateTime.fromJSDate(token.date_expires) > DateTime.utc()).to.equal(
        true
      );
    });
  });

  describe("consume", () => {
    it("should reject if cannot find token", async () => {
      const err = await expectError(() => service.consume("faketoken"));
      expectOperationError(err, "INVALID_TOKEN", HttpStatusCode.BAD_REQUEST);
    });

    it("should reject if token has already been consumed", async () => {
      const token = await createValidToken();

      await new VerificationTokenRepository().update({
        ...token,
        consumed: true,
      });

      const err = await expectError(() => service.consume(token.value));
      expectOperationError(err, "INVALID_TOKEN", HttpStatusCode.BAD_REQUEST);
    });

    it("should reject if token is expired", async () => {
      const token = await createValidToken();

      await new VerificationTokenRepository().update({
        ...token,
        date_expires: DateTime.utc().minus({ hour: 1 }).toJSDate(),
      });

      const err = await expectError(() => service.consume(token.value));
      expectOperationError(err, "EXPIRED_TOKEN", HttpStatusCode.BAD_REQUEST);
    });

    it("should succeed if valid", async () => {
      const token = await createValidToken();

      const result = await service.consume(token.value);
      expect(result.consumed).to.equal(true);
    });
  });
});
