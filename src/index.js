const { app, BrowserWindow, autoUpdater, dialog } = require("electron");
const path = require("path");
const os = require("os");

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
  mainWindow.webContents.openDevTools();

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

let updateFeed = "";
let appVersion = 2;
try {
  if (os.platform() === "darwin") {
    // updateFeed = "http://localhost:80/update/osx_64?update=true"; //http://localhost:80/download/osx_64 https://updates.publisherrocket.com/update/osx_64
    autoUpdater.setFeedURL('http://localhost:80/update/' + "osx_64" + '/' + "2.0.0" + '/' + "stable");
  } else {
  }

  // autoUpdater.setFeedURL(updateFeed);

  // autoUpdater.addListener("checking-for-update", (event) => {

  //   console.log(" 2. Checking for updates", event);
  //   console.log(" 3. The updateFeed URL is : ", updateFeed);
  //   updateFeed += appVersion;

  // });

  autoUpdater.on("checking-for-update", (event, releaseNotes, releaseName) => {
    console.log(" 2. Checking for updates", event);
    console.log(" 3. The updateFeed URL is : ", 'http://localhost:80/update/' + "osx_64" + '/' + "2.0.0" + '/' + "stable");
  });

  autoUpdater.on("update-not-available", (event) => {
    console.log("Update not available!", event);
  });

  autoUpdater.on("update-available", (event) => {
    console.log("new update available!");

    const buttons = ["OK"];
    dialog.showMessageBox(
      {
        type: "info",
        buttons,
        title: "Update available",
        message: "There is a new app update",
      },
      (buttonIndex) => {
        log.info(buttonIndex);
      }
    );
  });

  autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
    const dialogOpts = {
      type: "info",
      buttons: ["Restart", "Later"],
      title: "Application Update",
      message: process.platform === "win32" ? releaseNotes : releaseName,
      detail:
        "A new version has been downloaded. Restart the application to apply the updates.",
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall();
    });
  });

  autoUpdater.on("error", (message) => {
    console.error("There was a problem updating the application");
    console.error(message);
  });
} catch (error) {
  console.log("Caught error", error);
}
