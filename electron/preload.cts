console.log("PRELOAD CARGADO");
import { contextBridge, ipcRenderer } from "electron";

type AppConfig = {
  libraryPaths: string[];
};

type AudioFileExtension =
  | "mp3"
  | "wav"
  | "flac"
  | "aac"
  | "ogg"
  | "m4a";

type FoundTrack = {
  name: string;
  path: string;
  extension: AudioFileExtension;
};

type ScanFolderResult = {
  folderPath: string;
  tracks: FoundTrack[];
};

type SavePlaylistPayload = {
  playlistName: string;
  tracks: FoundTrack[];
};

type SavePlaylistResult =
  | {
    ok: true;
    playlist: {
      name: string;
      createdAt: string;
      updatedAt: string;
      tracks: FoundTrack[];
    };
  }
  | {
    ok: false;
    message: string;
  };

  type PlaylistSummary = {
  name: string;
  createdAt: string;
  updatedAt: string;
  count: number;
};

contextBridge.exposeInMainWorld("electronAPI", {
  selectFolder: async (): Promise<string | null> => {
    return await ipcRenderer.invoke("dialog:select-folder");
  },

  selectFiles: async (): Promise<string[]> => {
    return await ipcRenderer.invoke("dialog:select-files");
  },

  scanFolder: async (folderPath: string): Promise<ScanFolderResult> => {
    return await ipcRenderer.invoke("library:scan-folder", folderPath);
  },

  savePlaylist: async (
    payload: { playlistName: string; tracks: FoundTrack[] }
  ) => {
    return await ipcRenderer.invoke("playlist:save", payload);
  },

  getConfig: async (): Promise<AppConfig> => {
    return await ipcRenderer.invoke("config:get");
  },

  setLibraryPaths: async (paths: string[]): Promise<AppConfig> => {
    return await ipcRenderer.invoke("config:set-library-paths", paths);
  },

  addLibraryPath: async (dirPath: string): Promise<AppConfig> => {
    return await ipcRenderer.invoke("config:add-library-path", dirPath);
  },

  minimizeWindow: async (): Promise<void> => {
    await ipcRenderer.invoke("window:minimize");
  },

  toggleMaximizeWindow: async (): Promise<boolean> => {
    return await ipcRenderer.invoke("window:toggle-maximize");
  },

  closeWindow: async (): Promise<void> => {
    await ipcRenderer.invoke("window:close");
  },

  isWindowMaximized: async (): Promise<boolean> => {
    return await ipcRenderer.invoke("window:is-maximized");
  },
  
    getPlaylists: async (): Promise<PlaylistSummary[]> => {
    return await ipcRenderer.invoke("playlist:get-all");
  },
});