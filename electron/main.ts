import { app, BrowserWindow, Tray, Menu, nativeImage, Notification } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { spawn, type ChildProcess } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let serverProcess: ChildProcess | null = null;
const PORT = 3456;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 720,
    resizable: false,
    frame: true,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(`http://localhost:${PORT}/play`);

  mainWindow.on("close", (e) => {
    if (tray) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createTray() {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip("Tamago.ai");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show Pet",
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        tray?.destroy();
        tray = null;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

function startServer(): Promise<void> {
  return new Promise((resolve) => {
    const serverPath = path.join(app.getAppPath(), ".next", "standalone", "server.js");
    serverProcess = spawn("node", [serverPath], {
      env: {
        ...process.env,
        PORT: String(PORT),
        HOSTNAME: "localhost",
      },
      cwd: app.getAppPath(),
    });

    serverProcess.stdout?.on("data", (data: Buffer) => {
      const output = data.toString();
      if (output.includes("Ready") || output.includes("started")) {
        resolve();
      }
    });

    serverProcess.stderr?.on("data", (data: Buffer) => {
      console.error("Server error:", data.toString());
    });

    setTimeout(resolve, 5000);
  });
}

// Desktop notifications for critical stats
const lastNotificationTime: Record<string, number> = {};
const NOTIFICATION_COOLDOWN = 5 * 60 * 1000; // 5 minutes

function checkPetStats() {
  if (!mainWindow) return;

  mainWindow.webContents.executeJavaScript(`
    (() => {
      try {
        const saved = localStorage.getItem("tamago-ai-save");
        if (!saved) return null;
        const state = JSON.parse(saved);
        return state.pet?.stats || null;
      } catch { return null; }
    })()
  `).then((stats: { hunger: number; happiness: number; energy: number; hygiene: number } | null) => {
    if (!stats) return;

    const now = Date.now();
    const alerts: { stat: string; message: string }[] = [];

    if (stats.hunger < 15) alerts.push({ stat: "hunger", message: "Your pet is starving!" });
    if (stats.happiness < 15) alerts.push({ stat: "happiness", message: "Your pet is very unhappy..." });
    if (stats.energy < 10) alerts.push({ stat: "energy", message: "Your pet is exhausted!" });
    if (stats.hygiene < 10) alerts.push({ stat: "hygiene", message: "Your pet needs a bath!" });

    for (const alert of alerts) {
      const lastTime = lastNotificationTime[alert.stat] || 0;
      if (now - lastTime > NOTIFICATION_COOLDOWN) {
        new Notification({
          title: "Tamago.ai",
          body: alert.message,
        }).show();
        lastNotificationTime[alert.stat] = now;
      }
    }
  }).catch(() => {});
}

app.whenReady().then(async () => {
  if (app.isPackaged) {
    await startServer();
  }

  createWindow();
  createTray();

  // Check pet stats every 60 seconds for notifications
  setInterval(checkPetStats, 60_000);

  app.on("activate", () => {
    if (mainWindow === null) createWindow();
    else mainWindow.show();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin" && !tray) {
    app.quit();
  }
});

app.on("before-quit", () => {
  tray?.destroy();
  tray = null;
  serverProcess?.kill();
});
