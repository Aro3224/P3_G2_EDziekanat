const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const packageJsonPath = './package.json';
const packageJson = require(packageJsonPath);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'node_modules/expo-router/entry.js')
    }
  });

  packageJson.main = 'expo-router/entry';
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  mainWindow.loadURL('http://localhost:8081');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    packageJson.main = 'mainToOpenBoth.js';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
