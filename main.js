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
