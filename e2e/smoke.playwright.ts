import { expect, test } from "@playwright/test";

/**
 * Browser smoke test for Landesprobe. The happy-dom suite covers the rules;
 * this file checks what only a real browser shows: the six clue cards fit the
 * viewport, a card flips, the type-ahead answers, and the marks appear.
 */

const LAPTOP = { width: 1280, height: 757 };

test("a round boots with one open clue and five closed ones", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.setViewportSize(LAPTOP);
  await page.goto("/");

  await expect(page.locator("#root")).not.toBeEmpty();
  await expect(page).toHaveTitle(/Landesprobe/);
  await expect(
    page.getByRole("heading", { name: "Landesprobe" }),
  ).toBeVisible();

  await expect(page.locator(".card")).toHaveCount(6);
  await expect(page.locator(".card.locked")).toHaveCount(5);
  await expect(page.getByTestId("clue-tv")).toBeVisible();
  await expect(page.getByTestId("reveal")).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});

test("opening a clue flips its card", async ({ page }) => {
  await page.setViewportSize(LAPTOP);
  await page.goto("/");

  await page
    .getByRole("button", { name: /aufdecken/ })
    .first()
    .click();
  await expect(page.locator(".card.locked")).toHaveCount(4);
  await expect(page.getByTestId("clue-mains")).toBeVisible();
});

test("a guess through the type-ahead is compared with the open clues", async ({
  page,
}) => {
  await page.setViewportSize(LAPTOP);
  await page.goto("/");

  await page.getByLabel("Welches Land?").fill("Frank");
  const suggestion = page.getByRole("option", { name: /Frankreich/ });
  await expect(suggestion).toBeVisible();
  await suggestion.click();

  await expect(page.locator(".guess")).toHaveCount(1);
  await expect(page.locator(".mark")).toHaveCount(1);
});

test("nothing overflows the laptop viewport", async ({ page }) => {
  await page.setViewportSize(LAPTOP);
  await page.goto("/");

  const doc = await page.evaluate(() => {
    const el = document.scrollingElement;
    return {
      scrollWidth: el?.scrollWidth ?? 0,
      innerWidth: window.innerWidth,
    };
  });
  expect(doc.scrollWidth).toBeLessThanOrEqual(doc.innerWidth);
});
