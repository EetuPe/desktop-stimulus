import { app, BrowserWindow, screen } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Replace electron-is-dev with direct check
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

app.commandLine.appendSwitch("enable-transparent-visuals");
app.commandLine.appendSwitch("disable-gpu-sandbox");

let mainWindow;

function createWindow() {
  // Get primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      preload: path.join(__dirname, "preload.js"),
    },
    alwaysOnTop: true,
    focusable: true,
    skipTaskbar: false,
    hasShadow: false,
    titleBarStyle: "hidden",
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
        document.body.style.webkitAppRegion = 'no-drag';
        document.documentElement.style.webkitAppRegion = 'no-drag';

        // Enhanced image visibility fixes for Windows 11
        const images = document.getElementsByTagName('img');
        for (let img of images) {
          img.style.opacity = '1';
          img.style.visibility = 'visible';
          img.style.position = 'relative';
          img.style.zIndex = '9999';
          img.style.pointerEvents = 'auto';
          img.style.backfaceVisibility = 'visible';
          img.style.transform = 'translateZ(0)';
          img.style.webkitTransform = 'translateZ(0)';
          img.style.filter = 'none'; // Ensure no unwanted filters are applied
        }

        // Ensure container visibility
        const root = document.getElementById('root');
        if (root) {
          root.style.opacity = '1';
          root.style.visibility = 'visible';
          root.style.background = 'transparent';
          root.style.maxWidth = '100vw';
          root.style.margin = '0';
          root.style.padding = '0';
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
