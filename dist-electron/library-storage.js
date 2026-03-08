import { app } from "electron";
import fs from "node:fs";
import path from "node:path";
export function getPlaylistSummaries() {
    const library = readPlaylistLibrary();
    return library.playlists.map((playlist) => ({
        name: playlist.name,
        createdAt: playlist.createdAt,
        updatedAt: playlist.updatedAt,
        count: playlist.tracks.length,
    }));
}
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
export function getLibraryFolderPath() {
    const musicFolder = app.getPath("music");
    const s9dFolder = path.join(musicFolder, "S9D");
    ensureDir(s9dFolder);
    return s9dFolder;
}
export function getPlaylistJsonPath() {
    return path.join(getLibraryFolderPath(), "playlist.json");
}
export function readPlaylistLibrary() {
    const jsonPath = getPlaylistJsonPath();
    if (!fs.existsSync(jsonPath)) {
        const initialData = { playlists: [] };
        fs.writeFileSync(jsonPath, JSON.stringify(initialData, null, 2), "utf-8");
        return initialData;
    }
    try {
        const raw = fs.readFileSync(jsonPath, "utf-8");
        const parsed = JSON.parse(raw);
        return {
            playlists: Array.isArray(parsed.playlists) ? parsed.playlists : [],
        };
    }
    catch {
        const fallbackData = { playlists: [] };
        fs.writeFileSync(jsonPath, JSON.stringify(fallbackData, null, 2), "utf-8");
        return fallbackData;
    }
}
export function writePlaylistLibrary(data) {
    const jsonPath = getPlaylistJsonPath();
    ensureDir(path.dirname(jsonPath));
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf-8");
}
export function savePlaylist(playlistName, tracks) {
    const trimmedName = playlistName.trim();
    if (!trimmedName) {
        throw new Error("El nombre de la playlist es obligatorio.");
    }
    const library = readPlaylistLibrary();
    const now = new Date().toISOString();
    const normalizedTracks = Array.from(new Map(tracks.map((track) => [
        track.path,
        {
            name: track.name,
            path: track.path,
            extension: track.extension,
        },
    ])).values());
    const existingIndex = library.playlists.findIndex((playlist) => playlist.name.toLowerCase() === trimmedName.toLowerCase());
    let savedPlaylist;
    if (existingIndex >= 0) {
        const existing = library.playlists[existingIndex];
        savedPlaylist = {
            ...existing,
            name: trimmedName,
            updatedAt: now,
            tracks: normalizedTracks,
        };
        library.playlists[existingIndex] = savedPlaylist;
    }
    else {
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
