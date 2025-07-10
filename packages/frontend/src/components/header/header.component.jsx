import { NavLink } from "react-router-dom";
import styles from './header.module.css';

const Header = () => {
    const auth = useAuth()
    const username = auth.user?.profile?.username
    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <NavLink to="/" end className={styles.homeLink}>
                    <h1 className={styles.homeText}>Device Ticketing</h1>
                </NavLink>
                {username ?? <> <span>Hello </span>
                <span>{username}</span></>}
                
            </div>
        </header>
    );
};

export default Header;
