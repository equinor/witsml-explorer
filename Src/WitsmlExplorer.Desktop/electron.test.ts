import { _electron, expect, test } from "@playwright/test";
import { platform } from "os";
import * as path from "path";

function getExecutablePath() {
  switch (platform()) {
    case "win32":
      return path.join(
        __dirname,
        "dist",
        "win-unpacked",
        "Witsml Explorer Desktop.exe"
      );
    case "linux":
      return path.join(
        __dirname,
        "dist",
        "linux-unpacked",
        "Witsml Explorer Desktop"
      );
    default:
      throw new Error("Platform not configured for electron tests.");
  }
}

test("should open window and edit server list", async () => {
  const electronApp = await _electron.launch({
    executablePath: getExecutablePath()
  });

  const window = await electronApp.firstWindow();

  await window.click("role=button[name=/new server/i]");
  await window.fill(
    "role=textbox[name=/url/i]",
    "https://test.witsml.server.com"
  );
  await window.fill("role=textbox[name=/name/i]", "Test Witsml Server");
  await window.click("role=button[name=/save/i]");

  expect(await window.title()).toBe("WITSML Explorer");
  expect(await window.getByText("Test Witsml Server")).toBeVisible();

  await electronApp.close();
});
