import { NavLink } from "react-router-dom";
import styles from './header.module.css';

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <NavLink to="/" end className={styles.homeLink}>
                    <h1 className={styles.homeText}>Device Ticketing</h1>
                </NavLink>
            </div>
        </header>
    );
};

export default Header;
