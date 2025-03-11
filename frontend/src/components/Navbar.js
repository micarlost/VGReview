import React,{useState} from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { Button } from "./Button";
import SearchBar from "./SearchBar";
import { useLocation } from "react-router-dom";
import {FaBars,FaTimes } from "react-icons/fa";
import controllerLogo from "../images/controller.png";
function Navbar() {
    const [mobileMenuActive, setMobileMenuActive] = useState(false);
    /*Once user accounts are implemented on the backend add a useEffect to 
    fetch if the user is logged in and update the variable below */
    const [isLoggedIn] = useState(false);

    const handleMobileMenuClick = () => setMobileMenuActive(!mobileMenuActive);
    const closeMobileMenu = () => setMobileMenuActive(false);
    const location = useLocation();
    const hideSearchBar = location.pathname === "/login" || location.pathname === "/signup";

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
                <img src= {controllerLogo} alt="Logo" /> {/* Replace with your logo path */}
                &nbsp;VG Reviews
            </Link>

            <div className="navbar-container">
            {!hideSearchBar && (
                    <div className="search-bar-wrapper">
                        <SearchBar onChange={(e) => console.log(e.target.value)} />
                    </div>
                )}
                <div className="menu-icon" onClick={handleMobileMenuClick}>
                    {mobileMenuActive ? <FaTimes style={{color: "white"}}/> : <FaBars style={{color: "white"}} />}
                </div>
                <ul className= {mobileMenuActive ? "nav-menu active" : "nav-menu"}>
                    <li className="nav-item">
                    </li>
                    {/*If there is a user logged in replace the sign up and login buttons with the account button*/}
                    {!isLoggedIn ? 
                        <li className="nav-item">
                            <Link to="/login" className="nav-btns" onClick={closeMobileMenu}> 
                                <Button buttonStyle='btn--outline' buttonSize='btn--large'>Login</Button>
                            </Link>
                        </li>: 
                        <li className="nav-item">
                            <Link to="/account" className="nav-btns" onClick={closeMobileMenu}> 
                                <Button buttonStyle='btn--outline' buttonSize='btn--large'>Account</Button>
                            </Link>
                        </li>
                    }
                    {!isLoggedIn ? 
                        <li className="nav-item">
                            <Link to="/signup" className="nav-btns" onClick={closeMobileMenu}> 
                                <Button buttonStyle='btn--outline' buttonSize='btn--large'>Sign Up</Button>
                            </Link>
                        </li> : null
                    }
                </ul>
            </div>

        </nav>
    )
}

export default Navbar