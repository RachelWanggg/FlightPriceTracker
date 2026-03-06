import { useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import "./App.css";
import { useAuth } from "./context/authContext";
import { Login } from "./components/Login";
import SearchPage from "./pages/SearchPage";
import Alerts from "./pages/Alerts";

function App() {
  const { user, isAdmin, logout, loading: authLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="app">
      <header className="hero">
        <h1>✈️ Flight Search</h1>
        <p>Find the best routes, prices, and connections worldwide</p>
        <div className="auth-buttons">
          {user ? (
            <>
              <span>Welcome, {user.email}</span>
              {isAdmin && <span className="badge">Admin</span>}
              <Link className="btn ghost" to="/alerts">My Alerts</Link>
              <button className="btn ghost" onClick={logout}>Logout</button>
            </>
          ) : (
            <button className="btn ghost" onClick={() => setShowLoginModal(true)}>
              Login / Register
            </button>
          )}
        </div>
      </header>

      <main className="container">
        {/* Login Modal */}
        {showLoginModal && (
          <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setShowLoginModal(false)}>×</button>
              <Login onSuccess={() => setShowLoginModal(false)} />
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={<SearchPage onLoginRequired={() => setShowLoginModal(true)} />} />
          <Route path="/alerts" element={<Alerts />} />
        </Routes>
      </main>

      <footer>&copy; 2026 Rachel Wang</footer>
    </div>
  );
}

export default App;