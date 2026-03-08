import { useEffect, useRef, useState } from "react";
import styles from "./toolbar.module.css";
import logo from "../../assets/logo.png";

export default function Toolbar() {
  const trackText =
    "Texto de prueba de toolbar 1 2 3 4 5 6 7 8 9 10";

  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const segmentRef = useRef<HTMLSpanElement | null>(null);

  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const marqueeEl = marqueeRef.current;
    const segmentEl = segmentRef.current;

    if (!marqueeEl || !segmentEl) return;

    const GAP = 72;

    const updateLoopDistance = () => {
      const segmentWidth = segmentEl.getBoundingClientRect().width;
      marqueeEl.style.setProperty("--loop-distance", `${segmentWidth + GAP}px`);
    };

    updateLoopDistance();

    const resizeObserver = new ResizeObserver(() => {
      updateLoopDistance();
    });

    resizeObserver.observe(segmentEl);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const syncMaximizedState = async () => {
      const value = await window.electronAPI.isWindowMaximized();
      setIsMaximized(value);
    };

    void syncMaximizedState();

    const onResize = () => {
      void syncMaximizedState();
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handleMinimize = async () => {
    await window.electronAPI.minimizeWindow();
  };

  const handleToggleMaximize = async () => {
    const nextState = await window.electronAPI.toggleMaximizeWindow();
    setIsMaximized(nextState);
  };

  const handleClose = async () => {
    await window.electronAPI.closeWindow();
  };

  return (
    <header
      className={styles.toolbar}
      onDoubleClick={() => {
        void handleToggleMaximize();
      }}
    >
      <div className={styles.toolbar__left}>
        <img src={logo} alt="S9D Logo" className={styles.toolbar__logo} />
      </div>

      <div className={styles.toolbar__center}>
        <div className={styles.toolbar__trackViewport}>
          <div className={styles.toolbar__trackMarquee} ref={marqueeRef}>
            <span className={styles.toolbar__track} aria-hidden="true">
              {trackText}
            </span>

            <span className={styles.toolbar__track} ref={segmentRef}>
              {trackText}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.toolbar__right}>
        <button
          type="button"
          className={styles.toolbar__btn}
          title="Configuración"
        >
          ⚙
        </button>

        <button
          type="button"
          className={styles.toolbar__btn}
          title="Minimizar"
          onClick={() => {
            void handleMinimize();
          }}
        >
          —
        </button>

        <button
          type="button"
          className={styles.toolbar__btn}
          title={isMaximized ? "Restaurar" : "Maximizar"}
          onClick={() => {
            void handleToggleMaximize();
          }}
        >
          {isMaximized ? "❐" : "□"}
        </button>

        <button
          type="button"
          className={`${styles.toolbar__btn} ${styles["toolbar__btn--close"]}`}
          title="Cerrar"
          onClick={() => {
            void handleClose();
          }}
        >
          ✕
        </button>
      </div>
    </header>
  );
}