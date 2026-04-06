/** @type {import('electron-builder').Configuration} */
module.exports = {
  appId: "ai.tamago.app",
  productName: "Tamago.ai",
  directories: {
    output: "dist-electron",
  },
  files: [
    ".next/standalone/**/*",
    ".next/static/**/*",
    "public/**/*",
    "electron/**/*",
  ],
  mac: {
    target: "dmg",
    category: "public.app-category.entertainment",
  },
  win: {
    target: "nsis",
  },
  extraMetadata: {
    main: "electron/main.js",
  },
};
