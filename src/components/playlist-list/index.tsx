import styles from "./playlist-list.module.css";

export type PlaylistListItem = {
  id: string;
  name: string;
  subtitle: string;
  count: number;
};

type PlaylistListProps = {
  playlists: PlaylistListItem[];
  selectedId?: string;
  onSelect?: (playlistId: string) => void;
};

export default function PlaylistList({
  playlists,
  selectedId,
  onSelect,
}: PlaylistListProps) {
  return (
    <div className={styles.playlistList}>
      {playlists.map((playlist) => {
        const isActive = playlist.id === selectedId;

        return (
          <button
            key={playlist.id}
            type="button"
            className={`${styles.playlistList__item} ${isActive ? styles.playlistList__itemActive : ""}`}
            onClick={() => onSelect?.(playlist.id)}
          >
            <div className={styles.playlistList__icon} aria-hidden="true">
              ⚡
            </div>

            <div className={styles.playlistList__content}>
              <span className={styles.playlistList__name}>{playlist.name}</span>
              <span className={styles.playlistList__subtitle}>
                {playlist.subtitle}
              </span>
            </div>

            <span className={styles.playlistList__count}>{playlist.count}</span>
          </button>
        );
      })}
    </div>
  );
}