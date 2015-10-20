"use strict";

var app = require("app");
var BrowserWindow = require("browser-window");

require("crash-reporter").start();

var mainWindow = null;
app.on("window-all-closed", () => {
  if (process.platform != "darwin") {
    app.quit();
  }
});

app.on("ready", () => {
  mainWindow = new BrowserWindow({width: 1024, height: 768});
  mainWindow.loadUrl("file://" + __dirname + "/index.html");
  
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});

var ipc = require("ipc");

ipc.on("open:editor", (event, value) => {
    let editorWindow = new BrowserWindow({width: 1600, height: 1024});
    editorWindow.loadUrl("file://" + __dirname + "/editor.html");

    editorWindow.webContents.on("did-finish-load", () => {
      editorWindow.webContents.send("initialize-editor", value);
    });

    editorWindow.on("closed", () => {
      editorWindow = null;
    });
});

ipc.on("editor-update", (event, post) => {
  mainWindow.webContents.send("post-update", post);
});

