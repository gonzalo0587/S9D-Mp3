import styles from "./toolbar.module.css";
import logo from "../../assets/logo.png";

export default function Toolbar() {
    return (
        <header className={styles.toolbar}>
            <div className={styles.toolbar__left}>
                <img src={logo} alt="S9D Logo" className={styles.toolbar__logo} />
            </div>

            <div className={styles.toolbar__center}>
                <div className={styles.toolbar__trackViewport}>
                    <div className={styles.toolbar__trackMarquee}>
                        <span className={styles.toolbar__track}>Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias desde el año 1500, cuando un impresor (N. del T. persona que se dedica a la imprenta) desconocido usó</span>
                        <span
                            className={styles.toolbar__track}
                            aria-hidden="true"
                        >
                            Gojira - Explosia
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.toolbar__right}>
                <button className={styles.toolbar__btn}>⚙</button>
                <button className={styles.toolbar__btn}>—</button>
                <button className={styles.toolbar__btn}>□</button>
                <button className={`${styles.toolbar__btn} ${styles["toolbar__btn--close"]}`}>✕</button>
            </div>
        </header>
    );
}