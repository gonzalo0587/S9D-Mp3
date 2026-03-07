import styles from "./layout.module.css";
import Toolbar from "../toolbar";

type LayoutProps = {
  children?: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.layout}>
      {/* Fila 0: Acá va la toolbar */}
      <div data-layout-row="top">
        <Toolbar />
      </div>

      {/* Fila 1 */}
      <div data-layout-row="bottom">
        <div data-layout-col="library">
          {/* Biblioteca */}
        </div>

        <div data-layout-col="now-playing">
          {/* Ahora sonando */}
          {children}
        </div>

        <div data-layout-col="audio-lab">
          {/* Audio Lab */}
        </div>
      </div>
    </div>
  );
}