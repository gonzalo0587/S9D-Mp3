"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log("PRELOAD CARGADO");
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    selectFolder: async () => {
        return await electron_1.ipcRenderer.invoke("dialog:select-folder");
    },
    selectFiles: async () => {
        return await electron_1.ipcRenderer.invoke("dialog:select-files");
    },
    scanFolder: async (folderPath) => {
        return await electron_1.ipcRenderer.invoke("library:scan-folder", folderPath);
    },
    savePlaylist: async (payload) => {
        return await electron_1.ipcRenderer.invoke("playlist:save", payload);
    },
    getConfig: async () => {
        return await electron_1.ipcRenderer.invoke("config:get");
    },
    setLibraryPaths: async (paths) => {
        return await electron_1.ipcRenderer.invoke("config:set-library-paths", paths);
    },
    addLibraryPath: async (dirPath) => {
        return await electron_1.ipcRenderer.invoke("config:add-library-path", dirPath);
    },
    minimizeWindow: async () => {
        await electron_1.ipcRenderer.invoke("window:minimize");
    },
    toggleMaximizeWindow: async () => {
        return await electron_1.ipcRenderer.invoke("window:toggle-maximize");
    },
    closeWindow: async () => {
        await electron_1.ipcRenderer.invoke("window:close");
    },
    isWindowMaximized: async () => {
        return await electron_1.ipcRenderer.invoke("window:is-maximized");
    },
    getPlaylists: async () => {
        return await electron_1.ipcRenderer.invoke("playlist:get-all");
    },
});
