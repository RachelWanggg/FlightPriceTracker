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
  const [multiCityLegs, setMultiCityLegs] = useState(null);
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
    setFlights([]);
    setMultiCityLegs(null);

    try {
      const payload = { ...form };

      if (form.type === "3") {
        payload.multi_city_json = JSON.stringify(multiCities);
      }

      console.log("Sending request with payload:", payload);

      const res = await fetch("http://127.0.0.1:5001/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", res.status);
      console.log("Response OK?", res.ok);

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "API error");
      
      // Handle multi-city vs regular flights
      if (data.multi_city) {
        
        setMultiCityLegs(data.multi_city.legs);
        
      } else if (data.flights) {
        
        setFlights(data.flights || []);
       
      } else {
        
        setError("No flight data received from server");
      }
    }catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    timeStr = String(timeStr).trim();
    
    if (timeStr.includes(" ")) {
      const timePart = timeStr.split(" ")[1];
      return timePart ? timePart.substring(0, 5) : "N/A";
    }
    
    if (timeStr.includes("T")) {
      const timePart = timeStr.split("T")[1];
      return timePart ? timePart.substring(0, 5) : "N/A";
    }
    
    return timeStr.length >= 5 ? timeStr.substring(0, 5) : timeStr;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="app">
      <header className="hero">
        <h1>✈️ Flight Search</h1>
        <p>Find the best routes, prices, and connections worldwide</p>
      </header>

      <main className="container">
        {error && <div className="alert error">{error}</div>}

        <form className="card search-card" onSubmit={searchFlights}>
          <div className="grid two">
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="1">Round Trip</option>
              <option value="2">One Way</option>
              <option value="3">Multi-City</option>
            </select>

            <select
              name="travel_class"
              value={form.travel_class}
              onChange={handleChange}
            >
              <option value="1">Economy</option>
              <option value="2">Premium</option>
              <option value="3">Business</option>
              <option value="4">First</option>
            </select>
          </div>

          {form.type === "3" ? (
            <div className="stack">
              {multiCities.map((seg, i) => (
                <div className="segment glass" key={i}>
                  <span className="segment-label">Flight {i + 1}</span>
                  <div className="grid three">
                    <input
                      placeholder="From"
                      value={seg.departure_id}
                      onChange={(e) =>
                        handleMultiCityChange(i, "departure_id", e.target.value.toUpperCase())
                      }
                    />
                    <input
                      placeholder="To"
                      value={seg.arrival_id}
                      onChange={(e) =>
                        handleMultiCityChange(i, "arrival_id", e.target.value.toUpperCase())
                      }
                    />
                    <input
                      type="date"
                      value={seg.date}
                      onChange={(e) =>
                        handleMultiCityChange(i, "date", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
              <button type="button" className="btn ghost" onClick={addSegment}>
                + Add Segment
              </button>
            </div>
          ) : (
            <div className="grid two">
              <input
                name="origin"
                placeholder="From (SJC)"
                value={form.origin}
                onChange={handleChange}
              />
              <input
                name="destination"
                placeholder="To (LAX)"
                value={form.destination}
                onChange={handleChange}
              />
              <input
                type="date"
                name="outbound_date"
                value={form.outbound_date}
                onChange={handleChange}
              />
              {form.type === "1" && (
                <input
                  type="date"
                  name="return_date"
                  value={form.return_date}
                  onChange={handleChange}
                />
              )}
            </div>
          )}

          <button className="btn primary" disabled={loading}>
            {loading ? "Searching…" : "Search Flights"}
          </button>
        </form>

        {/* RESULTS */}
        {multiCityLegs && (
          <section className="results">
            {multiCityLegs.map((leg) => (
              <div className="card" key={leg.leg_number}>
                <h3>
                  Trip {leg.leg_number} · {leg.route}
                </h3>
                <p className="muted">{leg.date}</p>

                {(leg.flights || []).slice(0, 4).map((f, i) => (
                  <div className="flight-row" key={i}>
                    <span>${f.price}</span>
                    <span>
                      {f.flights[0].departure_airport.id} →
                      {f.flights[f.flights.length - 1].arrival_airport.id}
                    </span>
                    <span>
                      {f.flights[0].departure_airport.time} →
                      {f.flights[f.flights.length - 1].arrival_airport.time}
                    </span>
                    <span className="muted">
                      {f.flights.length - 1} stop(s)
                    </span>
                    <span className="muted">{f.flights[0].time} </span>
                  </div>
                ))}
              </div>
            ))}
          </section>
        )}

        {flights.length > 0 && (
          <section className="results">
            {flights.map((f, i) => (
              <div className="card" key={i}>
                <div className="flight-row">
                  <strong>${f.price}</strong>
                  <span>
                    {f.flights[0].departure_airport.id} →
                    {f.flights[f.flights.length - 1].arrival_airport.id}
                  </span>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      <footer>© 2026 Rachel Wang</footer>
    </div>
  );
}

export default App;