const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
});

const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",

  timeout: 30000,
  workers: 1,

  use: {
    channel: "chrome",
    headless: false,

    viewport: {
      width: 1280,
      height: 720,
    },

    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
  },
});