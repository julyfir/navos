import { test, expect } from "@playwright/test";

const EMAIL = `e2e-${Date.now()}@test.local`;
const PASSWORD = "test-password-123";

test("注册并创建网址的完整冒烟", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("昵称").fill("E2E 用户");
  await page.getByLabel("邮箱").fill(EMAIL);
  await page.getByLabel("密码").fill(PASSWORD);
  await page.getByRole("button", { name: "注册" }).click();
  await expect(page.getByText("注册成功")).toBeVisible({ timeout: 10000 });

  await page.goto("/admin/categories");
  await expect(
    page.getByRole("button", { name: "新建分类" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "新建分类" }).click();
  await page.getByLabel("名称").fill("开发");
  await page.getByRole("button", { name: "保存" }).click();
  await expect(page.getByText("开发")).toBeVisible();

  await page.goto("/admin/websites");
  await page.getByRole("button", { name: "批量导入" }).click();
  await page.getByPlaceholder("每行一个网址").fill("github.com");
  await page.getByRole("button", { name: "导入", exact: true }).click();
  await expect(page.getByText("github.com")).toBeVisible();

  await page.goto("/");
  const card = page.getByRole("link", { name: /github/ });
  await expect(card).toBeVisible();
  await card.hover();
});