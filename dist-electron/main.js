import { app, BrowserWindow, dialog, ipcMain } from "electron";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { savePlaylist, getPlaylistSummaries, } from "./library-storage.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let mainWindow = null;
const AUDIO_EXTENSIONS = new Set([
    "mp3",
    "wav",
    "flac",
    "aac",
    "ogg",
    "m4a",
]);
function getConfigPath() {
    return path.join(app.getPath("userData"), "config.json");
}
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
function readConfig() {
    const configPath = getConfigPath();
    if (!fs.existsSync(configPath)) {
        const defaultConfig = createDefaultConfig();
        writeConfig(defaultConfig);
        return defaultConfig;
    }
    try {
        const raw = fs.readFileSync(configPath, "utf-8");
        const parsed = JSON.parse(raw);
        return {
            libraryPaths: Array.isArray(parsed.libraryPaths) ? parsed.libraryPaths : [],
        };
    }
    catch {
        const defaultConfig = createDefaultConfig();
        writeConfig(defaultConfig);
        return defaultConfig;
    }
}
function writeConfig(config) {
    const configPath = getConfigPath();
    ensureDir(path.dirname(configPath));
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}
function createDefaultConfig() {
    const musicFolder = app.getPath("music");
    const s9dFolder = path.join(musicFolder, "S9D");
    ensureDir(s9dFolder);
    return {
        libraryPaths: [s9dFolder],
    };
}
function ensureAppConfig() {
    const config = readConfig();
    if (!config.libraryPaths.length) {
        const defaultConfig = createDefaultConfig();
        writeConfig(defaultConfig);
        return defaultConfig;
    }
    for (const dir of config.libraryPaths) {
        ensureDir(dir);
    }
    return config;
}
function getAudioExtension(filePath) {
    const ext = path.extname(filePath).toLowerCase().replace(".", "");
    if (AUDIO_EXTENSIONS.has(ext)) {
        return ext;
    }
    return null;
}
function scanFolderForAudioFiles(folderPath) {
    const tracks = [];
    function walk(currentPath) {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
                continue;
            }
            if (!entry.isFile()) {
                continue;
            }
            const extension = getAudioExtension(fullPath);
            if (!extension) {
                continue;
            }
            tracks.push({
                name: entry.name,
                path: fullPath,
                extension,
            });
        }
    }
    walk(folderPath);
    tracks.sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
    return {
        folderPath,
        tracks,
    };
}
function createWindow() {
    console.log("MAIN: createWindow()");
    console.log("MAIN __dirname:", __dirname);
    console.log("MAIN preload path:", path.join(__dirname, "preload.js"));
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        frame: false,
        titleBarStyle: "hidden",
        backgroundColor: "#0A0A12",
        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    /* Inicia la consola */
    /*  mainWindow.webContents.openDevTools(); */
    const isDev = !app.isPackaged;
    console.log("MAIN isDev:", isDev);
    if (isDev) {
        void mainWindow.loadURL("http://localhost:5173");
    }
    else {
        void mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
    }
}
app.whenReady().then(() => {
    console.log("MAIN: app.whenReady()");
    ensureAppConfig();
    createWindow();
    ipcMain.handle("window:minimize", () => {
        mainWindow?.minimize();
    });
    ipcMain.handle("window:toggle-maximize", () => {
        if (!mainWindow)
            return false;
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
            return false;
        }
        else {
            mainWindow.maximize();
            return true;
        }
    });
    ipcMain.handle("window:close", () => {
        mainWindow?.close();
    });
    ipcMain.handle("window:is-maximized", () => {
        return mainWindow?.isMaximized() ?? false;
    });
    ipcMain.handle("playlist:get-all", async () => {
        return getPlaylistSummaries();
    });
    ipcMain.handle("dialog:select-folder", async () => {
        console.log("MAIN: dialog:select-folder");
        if (!mainWindow) {
            console.log("MAIN: mainWindow es null");
            return null;
        }
        const result = await dialog.showOpenDialog(mainWindow, {
            title: "Seleccionar carpeta",
            properties: ["openDirectory"],
        });
        console.log("MAIN: resultado carpeta =", result);
        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }
        return result.filePaths[0];
    });
    ipcMain.handle("dialog:select-files", async () => {
        console.log("MAIN: dialog:select-files");
        if (!mainWindow) {
            console.log("MAIN: mainWindow es null");
            return [];
        }
        const result = await dialog.showOpenDialog(mainWindow, {
            title: "Seleccionar archivos",
            properties: ["openFile", "multiSelections"],
            filters: [
                {
                    name: "Audio",
                    extensions: ["mp3", "wav", "flac", "aac", "ogg", "m4a"],
                },
                {
                    name: "Todos los archivos",
                    extensions: ["*"],
                },
            ],
        });
        console.log("MAIN: resultado archivos =", result);
        if (result.canceled) {
            return [];
        }
        return result.filePaths;
    });
    ipcMain.handle("config:get", async () => {
        console.log("MAIN: config:get");
        return readConfig();
    });
    ipcMain.handle("config:set-library-paths", async (_event, paths) => {
        console.log("MAIN: config:set-library-paths =", paths);
        const cleanPaths = Array.from(new Set(paths
            .filter((p) => typeof p === "string")
            .map((p) => p.trim())
            .filter(Boolean)));
        for (const dir of cleanPaths) {
            ensureDir(dir);
        }
        const nextConfig = {
            libraryPaths: cleanPaths,
        };
        writeConfig(nextConfig);
        return nextConfig;
    });
    ipcMain.handle("config:add-library-path", async (_event, dirPath) => {
        console.log("MAIN: config:add-library-path =", dirPath);
        const current = readConfig();
        const normalized = dirPath.trim();
        if (!normalized) {
            return current;
        }
        ensureDir(normalized);
        const nextConfig = {
            libraryPaths: Array.from(new Set([...current.libraryPaths, normalized])),
        };
        writeConfig(nextConfig);
        return nextConfig;
    });
    ipcMain.handle("library:scan-folder", async (_event, folderPath) => {
        console.log("MAIN: library:scan-folder =", folderPath);
        if (!folderPath || typeof folderPath !== "string") {
            return {
                folderPath: "",
                tracks: [],
            };
        }
        try {
            return scanFolderForAudioFiles(folderPath);
        }
        catch (error) {
            console.error("MAIN: error escaneando carpeta", error);
            return {
                folderPath,
                tracks: [],
            };
        }
    });
    ipcMain.handle("playlist:save", async (_event, payload) => {
        console.log("MAIN: playlist:save =", payload);
        try {
            const savedPlaylist = savePlaylist(payload.playlistName, payload.tracks);
            return {
                ok: true,
                playlist: savedPlaylist,
            };
        }
        catch (error) {
            console.error("MAIN: error guardando playlist", error);
            return {
                ok: false,
                message: error instanceof Error
                    ? error.message
                    : "No se pudo guardar la playlist.",
            };
        }
    });
});
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
