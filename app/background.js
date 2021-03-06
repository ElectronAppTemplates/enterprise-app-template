// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, BrowserWindow } from 'electron';
import jetpack from 'fs-jetpack';
import pathUtil from 'path';
import toolbarMenu from './platform/toolbarmenu/main';
import windowStateKeeper from './platform/windowstate/main';

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import manifest from './manifest';
import env from './env';

var mainWindow;

// Preserver of the window size and position between app launches.
var mainWindowState = windowStateKeeper('main', {
  isMaximized: true,
  width: 1000,
  height: 600
});

var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

if (shouldQuit) {
  app.quit();
}

app.on('ready', function() {

  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    title: manifest.productName,
    width: mainWindowState.width,
    height: mainWindowState.height,
    preload: pathUtil.resolve(pathUtil.join(__dirname, 'platform/preloader/main.js'))
  });

  if (mainWindowState.isMaximized) {
    mainWindow.maximize();
  }

  if (env.name === 'test') {
    mainWindow.loadURL('file://' + __dirname + '/spec.html');
  } else if (env.name === 'DEV') {
    mainWindow.loadURL('file://' + __dirname + '/app.html');
  } else if (env.name === 'TST') {
    mainWindow.loadURL('file://' + __dirname + '/app.html');
  } else {
    mainWindow.loadURL('file://' + __dirname + '/app.html');
  }

  //Set Main Toolbar Menu
  toolbarMenu.setToolbarMenu(env, manifest);

  mainWindow.on('close', function() {
    mainWindowState.saveState(mainWindow);
  });
});

app.on('window-all-closed', function() {
  app.quit();
});
