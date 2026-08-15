import { test, expect } from "@playwright/test";

test("已有账号登录冒烟", async ({ page }) => {
  await page.request.post("/api/auth/sign-up/email", {
    data: {
      name: "Login 用户",
      email: "login@test.local",
      password: "test-password-123",
    },
  });
  await page.goto("/login");
  await page.getByLabel("邮箱").fill("login@test.local");
  await page.getByLabel("密码").fill("test-password-123");
  await page.getByRole("button", { name: "登录" }).click();
  await page.waitForURL("/", { timeout: 15000 });
  await expect(page.getByPlaceholder("搜索网址…")).toBeVisible();
});