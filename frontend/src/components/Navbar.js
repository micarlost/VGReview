import React,{useState, useEffect} from "react";
 import { Link } from "react-router-dom";
 import "./Navbar.css";
 import { Button } from "./Button";
 import { FaSchool,FaBars,FaTimes } from "react-icons/fa";
 function Navbar() {
     const [click, setClick] = useState(false);
     const [button, setButton] = useState(true);
 
     const handleClick = () => setClick(!click);
     const closeMobileMenu = () => setClick(false);
 
     //When the screen is made too small, hide the navbar buttons
 
     const showButton = () =>{
         if(window.innerWidth <= 960){
             setButton(false);
         } else  {
             setButton(true);
         }
     }
 
     window.addEventListener("resize", showButton);
     //This keeps buttons hidden when refreshing page
     useEffect(() => {
         showButton();
     }, [])
 
     
 
     return (
         <>
             <nav className="navbar">
                 <div className="navbar-container">
                     <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
                         <FaSchool />&nbsp;OLP
                     </Link>
                     <div className="menu-icon" onClick={handleClick}>
                         {click ? <FaTimes style={{color: "white"}}/> : <FaBars style={{color: "white"}} />}
                     </div>
                     <ul className= {click ? "nav-menu active" : "nav-menu"}>
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
                         <li className="nav-item">
                             <Link to="/login" className="nav-links-mobile" onClick={closeMobileMenu}>
                                 Log In
                             </Link>
                         </li>
                         <li className="nav-item">
                             <Link to="/signup" className="nav-links-mobile" onClick={closeMobileMenu}>
                                 Sign Up
                             </Link>
                         </li>
                     </ul>
                     <Link to="/login" className="btn-mobile"> 
                         {button && <Button buttonStyle="btn--outline">Log In</Button>}
                     </Link>
                     &nbsp;&nbsp;&nbsp;&nbsp;
                     <Link to="/signup">
                         {button && <Button buttonStyle="btn--outline">Sign Up</Button>}
                     </Link>
                     
                 </div>
             </nav>
         </>
     )
 }
 
 export default Navbar
 
 