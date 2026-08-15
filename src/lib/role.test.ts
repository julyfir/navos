import { describe, it, expect } from "vitest";
import { roleForFirstUser } from "./role";

describe("roleForFirstUser", () => {
  it("首个用户为 admin", () => {
    expect(roleForFirstUser(0)).toBe("admin");
  });
  it("后续用户为 member", () => {
    expect(roleForFirstUser(1)).toBe("member");
  });
});