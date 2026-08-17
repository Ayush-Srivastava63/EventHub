import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import './Navbar.css';

interface NavbarProps {
  isTransparent?: boolean;
}

export default function Navbar({ isTransparent = false }: NavbarProps) {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function handleLogout() {
    logout();
    navigate('/');
    setMobileOpen(false);
    setDropdownOpen(false);
  }

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className={`navbar ${isTransparent ? 'navbar--transparent' : ''}`} id="main-navbar">
      <div className="navbar__container">
        <div className="navbar__left">
          <Link to="/" className="navbar__brand" onClick={() => setMobileOpen(false)}>
            <img src="/logo.png" alt="EventHub Logo" className="navbar__logo-img" />
            <span className="navbar__title">EventHub</span>
          </Link>
        </div>

        <button
          className={`navbar__hamburger ${mobileOpen ? 'active' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar__center ${mobileOpen ? 'navbar__center--open' : ''}`}>
          {isAuthenticated && (
            <>
              <NavLink to="/events" className="navbar__link" onClick={() => setMobileOpen(false)}>
                Events
              </NavLink>
              <NavLink to="/my-events" className="navbar__link" onClick={() => setMobileOpen(false)}>
                My Events
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className="navbar__link" end onClick={() => setMobileOpen(false)}>
                  Dashboard
                </NavLink>
              )}
            </>
          )}
        </div>

        <div className="navbar__right">
          {isAuthenticated ? (
            <div className="navbar__user-menu" ref={dropdownRef}>
              <button 
                className="navbar__user-icon" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User Menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>
              
              {dropdownOpen && (
                <div className="navbar__dropdown">
                  <div className="navbar__dropdown-item" onClick={handleLogout}>
                    Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className="navbar__btn navbar__btn--outline" onClick={() => setMobileOpen(false)}>
              Login
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
