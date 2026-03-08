export { };

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

declare global {
  interface Window {
    electronAPI: {
      selectFolder: () => Promise<string | null>;
      selectFiles: () => Promise<string[]>;
      getConfig: () => Promise<AppConfig>;
      setLibraryPaths: (paths: string[]) => Promise<AppConfig>;
      addLibraryPath: (dirPath: string) => Promise<AppConfig>;
      minimizeWindow: () => Promise<void>;
      toggleMaximizeWindow: () => Promise<boolean>;
      closeWindow: () => Promise<void>;
      isWindowMaximized: () => Promise<boolean>;
      scanFolder: (folderPath: string) => Promise<ScanFolderResult>;
      savePlaylist: (payload: SavePlaylistPayload) => Promise<SavePlaylistResult>;
      getPlaylists: () => Promise<PlaylistSummary[]>;
    };
  }
}