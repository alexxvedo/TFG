import { app, BrowserWindow, ipcMain } from "electron";
import isDev from "electron-is-dev";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

let mainWindow;
let activeCollectionState = null;

// Función para verificar si el servidor está listo
async function waitForServer(url, maxAttempts = 5) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(url, { method: "HEAD" });
      if (response.ok) return true;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return false;
}

async function createWindow() {
  if (isDev) {
    try {
      const serverReady = await waitForServer("http://localhost:3000");
      if (!serverReady) {
        console.error("Development server not ready");
        app.quit();
        return;
      }
    } catch (error) {
      console.error("Error checking development server:", error);
      app.quit();
      return;
    }
  }

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    backgroundColor: "#ffffff",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: false,
    },
  });

  const startURL = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "../out/index.html")}`;

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  await mainWindow.loadURL(startURL);
}

// Escucha el evento `update-state` para recibir el estado desde la ventana principal
ipcMain.on("update-state", (event, newState) => {
  activeCollectionState = newState;
  console.log("Estado recibido en proceso principal:", activeCollectionState);
});

ipcMain.on("flashcard-added", (event, flashcard) => {
  if (mainWindow) {
    mainWindow.webContents.send("flashcard-added", flashcard);
  }
});

app.on("ready", () => {
  if (!isDev) {
    // exec("next start", (error, stdout, stderr) => {
    //   if (error) {
    //     console.error(`Error al iniciar el servidor de producción: ${error}`);
    //     return;
    //   }
    //   console.log(`stdout: ${stdout}`);
    //   console.error(`stderr: ${stderr}`);
    // });
  }
  createWindow();
});

// Optimizar el manejo de la app
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
