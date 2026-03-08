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

export type ScanFolderResult = {
  folderPath: string;
  tracks: FoundTrack[];
};

export type PlaylistSummary = {
  name: string;
  createdAt: string;
  updatedAt: string;
  count: number;
};