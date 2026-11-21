import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function ctx(user: TrpcContext["user"] = null): TrpcContext {
  return { user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: () => {} } as unknown as TrpcContext["res"] };
}
const normalUser = { id: 999999, openId: "t-user", email: null, name: "T", loginMethod: "manus", role: "user" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };

describe("store access control", () => {
  it("rejects cart access for guests", async () => {
    await expect(appRouter.createCaller(ctx()).cart.list()).rejects.toThrow();
  });
  it("rejects admin routes for non-admin users", async () => {
    await expect(appRouter.createCaller(ctx(normalUser)).admin.stats()).rejects.toThrow();
  });
  it("validates the contact form input", async () => {
    await expect(
      appRouter.createCaller(ctx()).contact.send({ name: "", email: "bad", subject: "", message: "" } as never),
    ).rejects.toThrow();
  });
});
