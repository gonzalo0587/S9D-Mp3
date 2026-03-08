import { useEffect, useRef, useState } from "react";
import styles from "./library-panel.module.css";
import AddTracksModal from "../add-tracks-modal";
import PlaylistList, { type PlaylistListItem } from "../playlist-list";
import type { FoundTrack, PlaylistSummary } from "../../types/media";

type MenuAction = "folder" | "file" | "playlist";

export default function LibraryPanel() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedFolderPath, setSelectedFolderPath] = useState("");
  const [foundTracks, setFoundTracks] = useState<FoundTrack[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistListItem[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("");

  const wrapRef = useRef<HTMLDivElement | null>(null);

  const buildPlaylistSubtitle = (playlist: PlaylistSummary): string => {
    const date = new Date(playlist.updatedAt);

    if (Number.isNaN(date.getTime())) {
      return "Playlist local";
    }

    return `Actualizada: ${date.toLocaleDateString("es-CL")}`;
  };

  const loadPlaylists = async () => {
    try {
      const result = await window.electronAPI.getPlaylists();

      const mapped: PlaylistListItem[] = result.map((playlist) => ({
        id: playlist.name,
        name: playlist.name,
        subtitle: buildPlaylistSubtitle(playlist),
        count: playlist.count,
      }));

      setPlaylists(mapped);

      setSelectedPlaylistId((current) => {
        if (current && mapped.some((item) => item.id === current)) {
          return current;
        }

        return mapped[0]?.id ?? "";
      });
    } catch (error) {
      console.error("RENDERER: error cargando playlists", error);
      setPlaylists([]);
      setSelectedPlaylistId("");
    }
  };

  useEffect(() => {
    void loadPlaylists();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (wrapRef.current && !wrapRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleMenuAction = async (action: MenuAction) => {
    console.log("RENDERER: acción =", action);
    setMenuOpen(false);

    if (action === "folder") {
      const folderPath = await window.electronAPI.selectFolder();
      console.log("RENDERER: folderPath =", folderPath);

      if (!folderPath) return;

      setSelectedFolderPath(folderPath);
      setFoundTracks([]);
      setIsScanModalOpen(true);
      setIsScanning(true);

      try {
        const result = await window.electronAPI.scanFolder(folderPath);
        console.log("RENDERER: resultado scanFolder =", result);
        setFoundTracks(result.tracks);
      } catch (error) {
        console.error("RENDERER: error en scanFolder", error);
        setFoundTracks([]);
      } finally {
        setIsScanning(false);
      }

      return;
    }

    if (action === "file") {
      const files = await window.electronAPI.selectFiles();
      console.log("RENDERER: Archivos seleccionados =", files);
      return;
    }

    if (action === "playlist") {
      console.log("RENDERER: Crear nueva playlist");
    }
  };

  const handleCloseModal = () => {
    if (isScanning) return;

    setIsScanModalOpen(false);
    setSelectedFolderPath("");
    setFoundTracks([]);
  };

  const handleConfirmAddTracks = async (playlistName: string) => {
    if (!selectedFolderPath) return;
    if (foundTracks.length === 0) return;

    const result = await window.electronAPI.savePlaylist({
      playlistName,
      tracks: foundTracks,
    });

    console.log("RENDERER: savePlaylist result =", result);

    if (!result.ok) {
      console.error("RENDERER: error guardando playlist =", result.message);
      return;
    }

    const updatedConfig = await window.electronAPI.addLibraryPath(selectedFolderPath);
    console.log("RENDERER: Config actualizada =", updatedConfig);

    setIsScanModalOpen(false);
    setSelectedFolderPath("");
    setFoundTracks([]);

    await loadPlaylists();
    setSelectedPlaylistId(playlistName);
  };

  return (
    <>
      <section className={styles.libraryPanel}>
        <div className={styles.libraryPanel__header}>
          <div className={styles.libraryPanel__headerLeft}>
            <h2 className={styles.libraryPanel__title}>Biblioteca</h2>
            <span className={styles.libraryPanel__badge}>LOCAL</span>
          </div>

          <div ref={wrapRef} className={styles.libraryPanel__menuAnchor}>
            <button
              type="button"
              className={styles.libraryPanel__newButton}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              + Nueva
            </button>

            {menuOpen && (
              <div className={styles.libraryPanel__dropdown} role="menu">
                <button
                  type="button"
                  className={styles.libraryPanel__dropdownItem}
                  onClick={() => {
                    void handleMenuAction("folder");
                  }}
                >
                  + Carpeta
                </button>

                <button
                  type="button"
                  className={styles.libraryPanel__dropdownItem}
                  onClick={() => {
                    void handleMenuAction("file");
                  }}
                >
                  + Archivo
                </button>

                <div className={styles.libraryPanel__dropdownDivider} />

                <button
                  type="button"
                  className={styles.libraryPanel__dropdownItem}
                  onClick={() => {
                    void handleMenuAction("playlist");
                  }}
                >
                  Nueva playlist
                </button>
              </div>
            )}
          </div>
        </div>

        <PlaylistList
          playlists={playlists}
          selectedId={selectedPlaylistId}
          onSelect={setSelectedPlaylistId}
        />
      </section>

      <AddTracksModal
        open={isScanModalOpen}
        folderPath={selectedFolderPath}
        tracks={foundTracks}
        loading={isScanning}
        onClose={handleCloseModal}
        onConfirm={(playlistName) => {
          void handleConfirmAddTracks(playlistName);
        }}
      />
    </>
  );
}