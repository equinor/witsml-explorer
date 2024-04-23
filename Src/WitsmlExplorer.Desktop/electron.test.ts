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
  await electronApp.close();
});

test("should open window and edit server list", async () => {
  const window = await electronApp.firstWindow();
  await window.click("role=button[name=/new server/i]");
  await window.fill(
    "role=textbox[name=/url/i]",
    "https://test.witsml.server.com"
  );
  await window.fill("role=textbox[name=/name/i]", "Test Witsml Server");
  await window.click("role=button[name=/save/i]");

  await window.waitForSelector("role=cell[name=/test witsml server/i]");

  const title = await window.title();
  const server = await window.$$("role=cell[name=/test witsml server/i]");

  expect(title).toBe("WITSML Explorer");
  expect(server.length).toBeGreaterThan(0);
});
