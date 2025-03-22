import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Replace electron-is-dev with direct check
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      preload: path.join(__dirname, "preload.js"),
    },
    alwaysOnTop: true,
    focusable: false,
    skipTaskbar: true,
    hasShadow: false,
    titleBarStyle: "hidden",
    // Add Windows-specific settings
    backgroundColor: "#00000000",
  });

  // Set click-through with forward option
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  // Platform-specific setup
  if (process.platform === "win32") {
    // Windows needs these specific settings
    mainWindow.setBackgroundColor("#00000000");
    mainWindow.webContents.once("did-finish-load", () => {
      mainWindow.webContents.executeJavaScript(`
        document.body.style.background = 'transparent';
        document.documentElement.style.background = 'transparent';
        document.body.style.backgroundColor = 'transparent';
        // Add these lines for Windows
        document.body.style.webkitAppRegion = 'no-drag';
        document.documentElement.style.webkitAppRegion = 'no-drag';
        // Ensure images are visible
        const images = document.getElementsByTagName('img');
        for(let img of images) {
          img.style.opacity = '1';
          img.style.visibility = 'visible';
        }
      `);
    });
  } else if (process.platform === "linux") {
    mainWindow.setBackgroundColor("#00000000");

    mainWindow.webContents.once("did-finish-load", () => {
      mainWindow.webContents.executeJavaScript(`
        document.body.style.background = 'transparent';
        document.documentElement.style.background = 'transparent';
      `);
    });
  }

  const startURL = isDev
    ? "http://localhost:5173"
    : `file://${path.join(__dirname, "dist/index.html")}`;

  mainWindow.loadURL(startURL);

  // Hide the window from taskbar
  mainWindow.setSkipTaskbar(true);

  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
