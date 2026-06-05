// When launched from a VS Code terminal, ELECTRON_RUN_AS_NODE=1 is inherited,
// which makes Electron run as plain Node.js (no browser process, no Electron API).
// Detect this in the packaged app and respawn cleanly without it.
// If ELECTRON_RUN_AS_NODE=1 is inherited (e.g. VS Code terminal), Electron skips
// its browser-process init and the electron module API isn't available.
// Detect this in the packaged app (execPath won't contain node_modules) and respawn cleanly.
if (process.env.ELECTRON_RUN_AS_NODE && !process.execPath.includes('node_modules')) {
  const { spawn } = require('child_process');
  const env = Object.assign({}, process.env);
  delete env.ELECTRON_RUN_AS_NODE;
  spawn(process.execPath, [], { detached: true, stdio: 'ignore', env }).unref();
  process.exit(0);
}

const { app, BrowserWindow, Tray, ipcMain, screen, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let tray = null;
let win = null;

function getDataPath() {
  return path.join(app.getPath('userData'), 'assignments.json');
}

function readAssignments() {
  const p = getDataPath();
  if (!fs.existsSync(p)) return [];
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return [];
  }
}

function writeAssignments(data) {
  fs.writeFileSync(getDataPath(), JSON.stringify(data, null, 2), 'utf8');
}

function buildTrayIcon() {
  // 1×1 transparent placeholder — visible label is set via tray.setTitle
  const buf = Buffer.alloc(4, 0);
  return nativeImage.createFromBitmap(buf, { width: 1, height: 1 });
}

function createWindow() {
  win = new BrowserWindow({
    width: 340,
    height: 480,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    hasShadow: true,
    skipTaskbar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('index.html');

  win.on('blur', () => {
    win.hide();
  });
}

function positionWindow() {
  const winBounds = win.getBounds();
  const cursorPos = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursorPos);
  const workArea = display.workArea;

  // Centre the window on the cursor x, just below the menu bar
  let x = Math.round(cursorPos.x - winBounds.width / 2);
  const menuBarBottom = workArea.y; // workArea.y == menu-bar height on primary display
  let y = menuBarBottom + 4;

  // clamp x within display
  if (x + winBounds.width > workArea.x + workArea.width) {
    x = workArea.x + workArea.width - winBounds.width - 4;
  }
  if (x < workArea.x) x = workArea.x + 4;

  win.setPosition(x, y, false);
}

app.whenReady().then(() => {
  app.dock.hide();

  tray = new Tray(buildTrayIcon());
  tray.setToolTip('AssignmentBar');
  tray.setTitle('🥤');

  createWindow();

  tray.on('click', () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      positionWindow();
      win.show();
      win.focus();
    }
  });

  ipcMain.handle('get-assignments', () => readAssignments());

  ipcMain.handle('save-assignments', (_e, assignments) => {
    writeAssignments(assignments);
    return true;
  });

  ipcMain.handle('close-window', () => {
    win.hide();
  });
});

app.on('window-all-closed', (e) => e.preventDefault());
