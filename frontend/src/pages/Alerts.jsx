import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/authContext";

function Alerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => {
      const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
      const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }, [alerts]);

  useEffect(() => {
    const loadAlerts = async () => {
      if (!user) {
        setAlerts([]);
        setLoading(false);
        return;
      }

      try {
        setError(null);
        setLoading(true);
        const q = query(collection(db, "priceAlerts"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map((docRef) => ({ id: docRef.id, ...docRef.data() }));
        setAlerts(items);
      } catch (err) {
        setError(err.message || "Failed to load alerts");
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, [user]);

  const toggleActive = async (alert) => {
    try {
      const ref = doc(db, "priceAlerts", alert.id);
      const nextActive = !alert.active;
      await updateDoc(ref, { active: nextActive });
      setAlerts((prev) => prev.map((item) => (item.id === alert.id ? { ...item, active: nextActive } : item)));
    } catch (err) {
      setError(err.message || "Failed to update alert");
    }
  };

  const removeAlert = async (alertId) => {
    try {
      await deleteDoc(doc(db, "priceAlerts", alertId));
      setAlerts((prev) => prev.filter((item) => item.id !== alertId));
    } catch (err) {
      setError(err.message || "Failed to delete alert");
    }
  };

  if (!user) {
    return (
      <div className="card">
        <h2>My Price Alerts</h2>
        <p>Please log in to manage your alerts.</p>
        <Link className="btn ghost" to="/">Back to search</Link>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="alerts-header">
        <h2>My Price Alerts</h2>
        <Link className="btn ghost" to="/">Back to search</Link>
      </div>

      {error && <div className="alert error">{error}</div>}
      {loading && <div className="muted">Loading alerts…</div>}

      {!loading && sortedAlerts.length === 0 && (
        <p className="muted">No alerts yet. Search flights and click “Set Alert”.</p>
      )}

      {!loading && sortedAlerts.length > 0 && (
        <div className="alerts-list">
          {sortedAlerts.map((alert) => (
            <div className="alert-item" key={alert.id}>
              <div>
                <div className="alert-route">
                  {alert.origin} → {alert.destination}
                </div>
                <div className="muted">
                  {alert.airline} {alert.flightNumber} · ${alert.currentPrice}
                </div>
                <div className="muted">Departure: {alert.departureDate}</div>
              </div>
              <div className="alert-actions">
                <button className="btn secondary" onClick={() => toggleActive(alert)}>
                  {alert.active ? "Disable" : "Enable"}
                </button>
                <button className="btn ghost" onClick={() => removeAlert(alert.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Alerts;
