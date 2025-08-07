import { describe, it, expect, beforeAll } from "vitest";
import { makeJWT, validateJWT } from "./auth";
import { NotFoundError } from "./errors";
describe("Password Hashing", () => {
    const password1 = "correctPassword123!";
    const password2 = "anotherPassword456!";
    let pass1;
    let pass2;
    beforeAll(async () => {
        pass1 = makeJWT("1", 1000, password1);
        pass2 = makeJWT("1", 0, password2);
    });
    it("should return true for the correct password", async () => {
        const result = await validateJWT(pass1, password1);
        expect(result).toBe("1");
    });
    it("should return true for the correct password", async () => {
        expect(() => validateJWT(pass2, password2)).toThrow(new NotFoundError("Couldnt validate JWT"));
    });
    it("should return true for the correct password", async () => {
        expect(() => validateJWT(pass1, password2)).toThrow(new NotFoundError("Couldnt validate JWT"));
    });
});
