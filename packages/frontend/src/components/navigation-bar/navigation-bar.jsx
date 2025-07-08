import { NavLink } from "react-router-dom";
import styles from './navigation-bar.module.css';

const NavBar = ({ onSignOut }) => {
    return (
        <div className={styles.sidebarNav}>
            <div className={styles.sidebarHeader}>
                <h3>Navigation</h3>
            </div>
            <div className={styles.sidebarContent}>
                <nav>
                    <NavLink to="/" end className={styles.navLink}>
                        Home
                    </NavLink>
                    <NavLink to="/ticket/create" end className={styles.navLink}>
                        Create Ticket
                    </NavLink>
                    <NavLink to="/device/create" end className={styles.navLink}>
                        Create Device
                    </NavLink>
                    <NavLink to="/device/table" end className={styles.navLink}>
                        All Devices
                    </NavLink>
                    <NavLink to="/ticket/management" end className={styles.navLink}>
                        All Tickets
                    </NavLink>
                </nav>
            </div>
            <div className={styles.sidebarFooter}>
                <button 
                    onClick={onSignOut}
                    className={styles.signOutButton}
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default NavBar;
