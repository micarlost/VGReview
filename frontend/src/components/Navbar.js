import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import "./Navbar.css";
import { Button } from "./Button";
import SearchBar from "./SearchBar";
import { useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import controllerLogo from "../images/controller.png";
import Cookies from 'js-cookie';

function Navbar() {
    const [mobileMenuActive, setMobileMenuActive] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null); // To store the logged-in user's ID

    const handleMobileMenuClick = () => setMobileMenuActive(!mobileMenuActive);
    const closeMobileMenu = () => setMobileMenuActive(false);

    const checkLoggedInStatus = useCallback(() => {
        const token = Cookies.get('token');
        const userId = Cookies.get('userId');  // Retrieve userId from cookies
        setIsLoggedIn(!!token);
        setUserId(userId);  // Set the userId
    }, []);

    useEffect(() => {
        checkLoggedInStatus();
    }, [checkLoggedInStatus]);

    const location = useLocation();
    const navigate = useNavigate();
    const hideSearchBar = location.pathname === "/login" || location.pathname === "/signup";
    
    const handleSearch = (query) => {
        if (query) {
          // Navigate to the search results page with the query
          navigate(`/search?query=${query}`);
        }
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
                <img src={controllerLogo} alt="Logo" /> {/* Replace with your logo path */}
                &nbsp;VG Reviews
            </Link>

            <div className="navbar-container">
                {!hideSearchBar && (
                    <div className="search-bar-wrapper">
                        <SearchBar onSearch={handleSearch} />
                    </div>
                )}
                <div className="menu-icon" onClick={handleMobileMenuClick}>
                    {mobileMenuActive ? <FaTimes style={{color: "white"}}/> : <FaBars style={{color: "white"}} />}
                </div>
                <ul className={mobileMenuActive ? "nav-menu active" : "nav-menu"}>

                    {/* Conditional rendering for account vs login/signup */}
                    {isLoggedIn ? (
                        <>
                            <li className="nav-item">
                                <Link to={`/profile/${userId}`} className="nav-btns" onClick={closeMobileMenu}>
                                    <Button buttonStyle='btn--outline' buttonSize='btn--large'>Profile</Button>
                                </Link>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="nav-item">
                                <Link to="/login" className="nav-btns" onClick={closeMobileMenu}>
                                    <Button buttonStyle='btn--outline' buttonSize='btn--large'>Log In</Button>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/signup" className="nav-btns" onClick={closeMobileMenu}>
                                    <Button buttonStyle='btn--outline' buttonSize='btn--large'>Sign Up</Button>
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
