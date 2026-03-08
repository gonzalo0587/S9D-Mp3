import { app } from "electron";
import fs from "node:fs";
import path from "node:path";

export type AudioFileExtension =
  | "mp3"
  | "wav"
  | "flac"
  | "aac"
  | "ogg"
  | "m4a";

export type FoundTrack = {
  name: string;
  path: string;
  extension: AudioFileExtension;
};

export type StoredPlaylist = {
  name: string;
  createdAt: string;
  updatedAt: string;
  tracks: FoundTrack[];
};

export type PlaylistLibrary = {
  playlists: StoredPlaylist[];
};

export type PlaylistSummary = {
  name: string;
  createdAt: string;
  updatedAt: string;
  count: number;
};

export function getPlaylistSummaries(): PlaylistSummary[] {
  const library = readPlaylistLibrary();

  return library.playlists.map((playlist) => ({
    name: playlist.name,
    createdAt: playlist.createdAt,
    updatedAt: playlist.updatedAt,
    count: playlist.tracks.length,
  }));
}

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function getLibraryFolderPath(): string {
  const musicFolder = app.getPath("music");
  const s9dFolder = path.join(musicFolder, "S9D");
  ensureDir(s9dFolder);
  return s9dFolder;
}

export function getPlaylistJsonPath(): string {
  return path.join(getLibraryFolderPath(), "playlist.json");
}

export function readPlaylistLibrary(): PlaylistLibrary {
  const jsonPath = getPlaylistJsonPath();

  if (!fs.existsSync(jsonPath)) {
    const initialData: PlaylistLibrary = { playlists: [] };
    fs.writeFileSync(jsonPath, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }

  try {
    const raw = fs.readFileSync(jsonPath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<PlaylistLibrary>;

    return {
      playlists: Array.isArray(parsed.playlists) ? parsed.playlists : [],
    };
  } catch {
    const fallbackData: PlaylistLibrary = { playlists: [] };
    fs.writeFileSync(jsonPath, JSON.stringify(fallbackData, null, 2), "utf-8");
    return fallbackData;
  }
}

export function writePlaylistLibrary(data: PlaylistLibrary) {
  const jsonPath = getPlaylistJsonPath();
  ensureDir(path.dirname(jsonPath));
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf-8");
}

export function savePlaylist(
  playlistName: string,
  tracks: FoundTrack[]
): StoredPlaylist {
  const trimmedName = playlistName.trim();

  if (!trimmedName) {
    throw new Error("El nombre de la playlist es obligatorio.");
  }

  const library = readPlaylistLibrary();
  const now = new Date().toISOString();

  const normalizedTracks = Array.from(
    new Map(
      tracks.map((track) => [
        track.path,
        {
          name: track.name,
          path: track.path,
          extension: track.extension,
        },
      ])
    ).values()
  );

  const existingIndex = library.playlists.findIndex(
    (playlist) => playlist.name.toLowerCase() === trimmedName.toLowerCase()
  );

  let savedPlaylist: StoredPlaylist;

  if (existingIndex >= 0) {
    const existing = library.playlists[existingIndex];

    savedPlaylist = {
      ...existing,
      name: trimmedName,
      updatedAt: now,
      tracks: normalizedTracks,
    };

    library.playlists[existingIndex] = savedPlaylist;
  } else {
    savedPlaylist = {
      name: trimmedName,
      createdAt: now,
      updatedAt: now,
      tracks: normalizedTracks,
    };

    library.playlists.push(savedPlaylist);
  }

  writePlaylistLibrary(library);
  return savedPlaylist;
}