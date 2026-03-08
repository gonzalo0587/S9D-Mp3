import { useEffect, useState } from "react";
import styles from "./add-tracks-modal.module.css";
import type { FoundTrack } from "../../types/media";

type AddTracksModalProps = {
  open: boolean;
  folderPath: string;
  tracks: FoundTrack[];
  loading?: boolean;
  onClose: () => void;
  onConfirm: (playlistName: string) => void;
};

export default function AddTracksModal({
  open,
  folderPath,
  tracks,
  loading = false,
  onClose,
  onConfirm,
}: AddTracksModalProps) {
  const [playlistName, setPlaylistName] = useState("");

  useEffect(() => {
    if (!open) {
      setPlaylistName("");
      return;
    }

    const defaultName =
      folderPath.trim().split(/[\\/]/).filter(Boolean).pop() || "";

    setPlaylistName(defaultName);
  }, [open, folderPath]);

  if (!open) return null;

  const trimmedPlaylistName = playlistName.trim();
  const canConfirm =
    !loading && tracks.length > 0 && trimmedPlaylistName.length > 0;

  return (
    <div className={styles.modalOverlay}>
  <div
    className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Canciones encontradas"
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderText}>
            <h3 className={styles.modalTitle}>Canciones encontradas</h3>
            <p className={styles.modalSubtitle}>
              {loading
                ? "Buscando archivos de audio..."
                : `${tracks.length} archivo(s) detectado(s) en la carpeta seleccionada`}
            </p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className={styles.metaBlock}>
          <span className={styles.metaLabel}>Carpeta</span>
          <div className={styles.metaValue} title={folderPath}>
            {folderPath || "Sin carpeta seleccionada"}
          </div>
        </div>

        <div className={styles.metaBlock}>
          <label htmlFor="playlist-name" className={styles.metaLabel}>
            Nombre de la playlist
          </label>
          <input
            id="playlist-name"
            type="text"
            className={styles.playlistInput}
            value={playlistName}
            onChange={(event) => setPlaylistName(event.target.value)}
            placeholder="Escribe un nombre para la playlist"
            maxLength={120}
          />
        </div>

        <div className={styles.listWrapper}>
          {loading ? (
            <div className={styles.emptyState}>Cargando canciones...</div>
          ) : tracks.length === 0 ? (
            <div className={styles.emptyState}>
              No se encontraron archivos compatibles.
            </div>
          ) : (
            <div className={styles.trackList}>
              {tracks.map((track) => (
                <div key={track.path} className={styles.trackRow}>
                  <div className={styles.trackMain}>
                    <div className={styles.trackName} title={track.name}>
                      {track.name}
                    </div>
                    <div className={styles.trackPath} title={track.path}>
                      {track.path}
                    </div>
                  </div>

                  <span className={styles.trackExt}>
                    {track.extension.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => onConfirm(trimmedPlaylistName)}
            disabled={!canConfirm}
          >
            Agregar a biblioteca
          </button>
        </div>
      </div>
    </div>
  );
}