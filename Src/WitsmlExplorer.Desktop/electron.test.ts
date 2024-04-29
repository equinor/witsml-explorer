/* eslint-disable no-console */
import { ElectronApplication, _electron, expect, test } from "@playwright/test";
import * as eph from "electron-playwright-helpers";

let electronApp: ElectronApplication;

test.beforeAll(async () => {
  const latestBuild = eph.findLatestBuild("dist");
  const appInfo = eph.parseElectronApp(latestBuild);
  electronApp = await _electron.launch({
    args: [appInfo.main],
    executablePath: appInfo.executable
  });

  electronApp.on("window", async (page) => {
    page.on("pageerror", (error) => {
      console.error(error);
    });
    page.on("console", (msg) => {
      console.log(msg.text());
    });
  });
});

test.afterAll(async () => {
  electronApp.windows()?.forEach((window) => window.close());
  await electronApp.close();
});

test("should open window and edit server list", async () => {
  // arrange
  const serverName = "Test Witsml Server 123";
  const window = await electronApp.firstWindow();

  // act
  await window.click("role=button[name=/new server/i]");
  await window.fill(
    "role=textbox[name=/url/i]",
    "https://test.witsml.server.com"
  );
  await window.fill("role=textbox[name=/name/i]", serverName);
  await window.click("role=button[name=/save/i]");

  await window.waitForSelector(`role=cell[name=/${serverName}/i]`);

  const title = await window.title();
  const server = await window.$$(`role=cell[name=/${serverName}/i]`);

  // cleanup
  const row = window.locator("role=row", { hasText: serverName });
  const deleteButton = row.locator(`data-testid=deleteServerButton`);
  await deleteButton.click();
  await window.click("role=button[name=/remove server/i]");

  // assert
  expect(title).toBe("WITSML Explorer");
  expect(server.length).toBeGreaterThan(0);
});
