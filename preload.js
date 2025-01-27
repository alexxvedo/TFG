const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFlashcardEditor: (workspaceId, collectionId) =>
    ipcRenderer.send("open-flashcard-editor", workspaceId, collectionId),
  updateState: (newState) => ipcRenderer.send("update-state", newState),
  onSyncState: (callback) =>
    ipcRenderer.on("sync-state", (event, state) => callback(state)),
  notifyFlashcardAdded: (flashcard) =>
    ipcRenderer.send("flashcard-added", flashcard),
  onFlashcardAdded: (callback) =>
    ipcRenderer.on("flashcard-added", (event, flashcard) =>
      callback(flashcard)
    ),
});
