import React,{useState} from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { Button } from "./Button";
import { FaSchool,FaBars,FaTimes } from "react-icons/fa";
function Navbar() {
    const [mobileMenuActive, setMobileMenuActive] = useState(false);
    /*Once user accounts are implemented on the backend add a useEffect to 
    fetch if the user is logged in and update the variable below */
    const [isLoggedIn] = useState(false);

    const handleMobileMenuClick = () => setMobileMenuActive(!mobileMenuActive);
    const closeMobileMenu = () => setMobileMenuActive(false);

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
                    <FaSchool />&nbsp;OLP
            </Link>
            <div className="navbar-container">
                <div className="menu-icon" onClick={handleMobileMenuClick}>
                    {mobileMenuActive ? <FaTimes style={{color: "white"}}/> : <FaBars style={{color: "white"}} />}
                </div>
                <ul className= {mobileMenuActive ? "nav-menu active" : "nav-menu"}>
                    <li className="nav-item">
                        <Link to="/" className="nav-links" onClick={closeMobileMenu}>
                            Home
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/courses" className="nav-links" onClick={closeMobileMenu}>
                            Courses
                        </Link>
                    </li>
                    {/*If there is a user logged in replace the sign up and login buttons with the account button*/}
                    {!isLoggedIn ? 
                        <li className="nav-item">
                            <Link to="/login" className="nav-btns" onClick={closeMobileMenu}> 
                                <Button buttonStyle='btn--outline' buttonSize='btn--large'>Log In</Button>
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