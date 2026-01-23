import { useState } from "react";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    type: "2",
    travel_class: "1",
    adults: "1",
    origin: "",
    destination: "",
    outbound_date: "",
    return_date: "",
    hl: "en",
    gl: "US",
    currency: "USD"
  });

  const [multiCities, setMultiCities] = useState([
    { departure_id: "", arrival_id: "", date: "" },
  ]);

  const [flights, setFlights] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleMultiCityChange = (index, field, value) => {
    const updated = [...multiCities];
    updated[index][field] = value;
    setMultiCities(updated);
  };

  const addSegment = () => setMultiCities([...multiCities, { departure_id: "", arrival_id: "", date: "" }]);

  const searchFlights = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = { ...form };

      if (form.type === "3") {
        payload.multi_city_json = JSON.stringify(multiCities);
      }

      const res = await fetch("http://127.0.0.1:5001/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API error");

      setFlights(data.flights || []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    // Handle "2026-03-03 10:40" format - extract time after space
    if (timeStr.includes(" ")) {
      return timeStr.split(" ")[1];
    }
    // Handle ISO format "2026-01-22T12:00:00" - extract time after T
    if (timeStr.includes("T")) {
      return timeStr.split("T")[1].substring(0, 5);
    }
    // Default: extract first 5 characters (HH:MM)
    return timeStr.substring(0, 5);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="container">
      <h1>✈️ Flight Search</h1>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={searchFlights} className="search-form">
        <label>Trip Type:</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="1">Round trip</option>
          <option value="2">One way</option>
          <option value="3">Multi-city</option>
        </select>

        <label>Travel Class:</label>
        <select name="travel_class" value={form.travel_class} onChange={handleChange}>
          <option value="1">Economy</option>
          <option value="2">Premium Economy</option>
          <option value="3">Business</option>
          <option value="4">First Class</option>
        </select>

        {form.type === "3" ? (
          <>
            {multiCities.map((seg, i) => (
              <div key={i} className="multi-city-segment">
                <input
                  placeholder="From (Airport Code)"
                  value={seg.departure_id}
                  onChange={(e) => handleMultiCityChange(i, "departure_id", e.target.value)}
                />
                <input
                  placeholder="To (Airport Code)"
                  value={seg.arrival_id}
                  onChange={(e) => handleMultiCityChange(i, "arrival_id", e.target.value)}
                />
                <input
                  type="date"
                  value={seg.date}
                  onChange={(e) => handleMultiCityChange(i, "date", e.target.value)}
                />
              </div>
            ))}
            <button type="button" onClick={addSegment} className="button-secondary">+ Add Segment</button>
          </>
        ) : (
          <>
            <input name="origin" placeholder="From" value={form.origin} onChange={handleChange} />
            <input name="destination" placeholder="To" value={form.destination} onChange={handleChange} />
            <input type="date" name="outbound_date" value={form.outbound_date} onChange={handleChange} />
            {form.type === "1" && <input type="date" name="return_date" value={form.return_date} onChange={handleChange} />}
          </>
        )}

        <button type="submit" className="button">{loading ? "Searching..." : "Search Flights"}</button>
      </form>

      {flights.length > 0 && (
        <div className="results-container">
          <h2>Found {flights.length} Flight(s)</h2>
          <div className="flights-grid">
            {flights.map((flight, i) => (
              <div key={i} className="flight-card">
                <div className="flight-header">
                  <div className="price-badge">${flight.price}</div>
                  <div className="travel-class-badge">
                    {form.travel_class === "1" && "Economy"}
                    {form.travel_class === "2" && "Premium Economy"}
                    {form.travel_class === "3" && "Business"}
                    {form.travel_class === "4" && "First Class"}
                  </div>
                </div>

                <div className="flight-route">
                  <span className="airport">{flight.flights[0].departure_airport.name}</span>
                  <span className="arrow">→</span>
                  <span className="airport">{flight.flights[flight.flights.length - 1].arrival_airport.name}</span>
                </div>

                <div className="flight-details">
                  {flight.flights.map((leg, legIndex) => (
                    <div key={legIndex} className="leg">
                      <div className="leg-info">
                        <div className="departure">
                          <strong>{formatTime(leg.departure_airport.time)}</strong>
                          
                        </div>
                        <div className="duration">{formatDuration(leg.duration)}</div>
                        <div className="arrival">
                          <strong>{formatTime(leg.arrival_airport.time)}</strong>
                          
                        </div>
                      </div>
                      <div className="airline-info">
                        <small>{leg.airline_name}</small>
                        <small>Flight {leg.flight_number}</small>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="button-book">Book Now</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="copyright">
        <p>&copy; 2026 Rachel Wang. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;



