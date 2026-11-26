import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../context/ThemeContext";

function Navbar({ email }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
  }

  return (
    <nav className="dashboard-navbar">
      <Link to="/dashboard" className="dashboard-brand">
        Shipyard<span>.</span>
      </Link>

      <div className="navbar-user-actions">
        <ThemeToggle />
        <div className="user-info-card">
          <div className="user-avatar">
            {email.charAt(0).toUpperCase()}
          </div>

          <div className="user-details">
            <p className="user-label">SIGNED IN AS</p>
            <h3>{email}</h3>
          </div>
        </div>

        <button className="btn btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
