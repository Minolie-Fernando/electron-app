const { app, BrowserWindow, autoUpdater, dialog } = require("electron");
const path = require("path");
const os = require("os");
const log = require("electron-log");

log.initialize();

log.info("Log from the main process");

log.transports.file.file = "./debug.log";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  console.log("1. Running auto updates check for updates");
  autoUpdater.checkForUpdates();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Configure auto-updater to use electron-log
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "debug";

let updateFeed = "";
let appVersion = app.getVersion();

try {
  if (os.platform() === "darwin") {
    updateFeed = `http://localhost:1337/update/osx/${appVersion}/`;
  } else {
    updateFeed = `http://localhost:1337/update/windows_64/${appVersion}/`;
  }

  autoUpdater.setFeedURL({ url: updateFeed });

  autoUpdater.on("update-available", (event) => {
    console.log("new update available!");
    console.log("updateFeed", updateFeed);

    const buttons = ["OK"];
    dialog.showMessageBox(
      {
        type: "info",
        buttons,
        title: "Update available",
        message: "There is a new app update",
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          console.log("Calling update function");
          autoUpdater.checkForUpdates();
        }
      }
    );
  });

  autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
    console.log("Update downloaded!!!");
    dialog
      .showMessageBox({
        type: "question",
        buttons: ["Install and Restart", "Later"],
        defaultId: 0,
        message:
          "A new update has been downloaded. Would you like to install and restart the app now?",
      })
      .then((selection) => {
        if (selection.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });

  autoUpdater.on("update-not-available", (event) => {
    console.log("Update not available!", event);
    const buttons = ["OK"];
    dialog.showMessageBox(
      {
        type: "info",
        buttons,
        title: "Not update available",
        message: "Not update available",
      },
      (buttonIndex) => {
        log.info(buttonIndex);
      }
    );
  });

  autoUpdater.on("error", (message) => {
    console.error("There was a problem updating the application");
    console.error(message);
    dialog
      .showMessageBox({
        type: "error",
        buttons: ["OK"],
        defaultId: 0,
        message:
          `There was an error with the update : ${message}`,
      })
      .then((selection) => {
        if (selection.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });
} catch (error) {
  console.log("Caught error", error);
}
