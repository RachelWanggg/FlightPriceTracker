import { useState, useEffect } from "react";
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
  const [returnFlights, setReturnFlights] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedFlights, setSelectedFlights] = useState([]);
  const [currentLeg, setCurrentLeg] = useState(0);
  const [departureToken, setDepartureToken] = useState(null);
  const [multiCityLegs, setMultiCityLegs] = useState(null);
  const [currentFlights, setCurrentFlights] = useState([]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleMultiCityChange = (index, field, value) => {
    const updated = [...multiCities];
    updated[index][field] = value;
    setMultiCities(updated);
  };

  const addSegment = () => setMultiCities([...multiCities, { departure_id: "", arrival_id: "", date: "" }]);

  //----- Search function:
  const searchFlights = async (payloadOverride = null) => {
    setLoading(true);
    setError(null);
    setFlights([]);
    setMultiCityLegs(null);
    setCurrentFlights([]);
    setSelectedFlights([]);
    setCurrentLeg(0);

    // 2. Prepare payload and make API request
    try {
      const payload = payloadOverride || { ...form };

      if (form.type === "3" && !payload.departure_token) {
        payload.multi_city_json = JSON.stringify(multiCities);
      }
      console.log("SEARCH PAYLOAD:", payload);

      // 3. Make POST request to backend API
      const res = await fetch("http://127.0.0.1:5001/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("API RESPONSE:", data);

      if (!res.ok) throw new Error(data.error || "API error");

      // Handle multi-city vs regular flights
      if (data.multi_city) {
        setMultiCityLegs(data.multi_city.legs);
        setCurrentFlights(data.multi_city.legs[0].flights || []);
      }
      else if (data.flights) {
        setFlights(data.flights || []);
      }
      else {
        setError("No flight data received from server");
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
    setLoading(false);
  };



  const handleFlightReturn = async (flight) => {
    if (!form.return_date) return alert("Set return date first!");
    const flightKey = flight.flights[0].flight_number;

    setReturnFlights((prev) => ({ ...prev, [flightKey]: "loading" }));

    try {
      const res = await fetch("http://127.0.0.1:5001/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: form.origin,
          destination: form.destination,
          outbound_date: form.outbound_date,
          return_date: form.return_date,
          type: "1",
          currency: form.currency,
          gl: form.gl,
          hl: form.hl,
          departure_token: flight.departure_token,
          travel_class: form.travel_class,
          adults: form.adults
        }),
      },
      );

      const data = await res.json();
      //console.log("RETURN API RESPONSE:", data);
      if (res.ok && data.flights) {
        setReturnFlights((prev) => ({ ...prev, [flightKey]: data.flights }));
      } else {
        setReturnFlights((prev) => ({ ...prev, [flightKey]: [] }));
        console.error("Error fetching return flights:", data.error);
      }
    } catch (err) {
      console.error(err);
      setReturnFlights((prev) => ({ ...prev, [flightKey]: [] }));
    }
  };

  // --- Select Flight (for multi-city) ---
  const handleSelectFlight = async (flight) => {
    const nextLegIndex = selectedFlights.length;
    setSelectedFlights((prev) => [...prev, flight]);

    // All legs selected
    if (nextLegIndex >= multiCities.length - 1) {
      console.log("All legs selected!");
      setCurrentFlights([]);
      return;
    }

    // Fetch next leg flights
    const nextLeg = multiCities[nextLegIndex + 1];
    if (!nextLeg) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        type: "3",
        multi_city_json: JSON.stringify(multiCities),
        travel_class: form.travel_class,
        adults: form.adults,
        hl: form.hl,
        gl: form.gl,
        currency: form.currency,
      };

      console.log("SEARCH PAYLOAD FOR NEXT LEG:", payload);

      const res = await fetch("http://127.0.0.1:5001/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API error");

      setCurrentFlights(data.multi_city?.legs?.[nextLegIndex + 1]?.flights || []);
      setCurrentLeg(nextLegIndex + 1);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };




  // --- Fetch flights for the next multi-city leg whenever departureToken or currentLeg changes ---
  // useEffect(() => {
  //   const fetchNextLeg = async () => {
  //     if (!departureToken || currentLeg >= multiCityLegs.length) return;

  //     setLoading(true);
  //     setError(null);

  //     const leg = multiCities[currentLeg];
  //     try {
  //       const res = await fetch("http://127.0.0.1:5001/search", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           type: "3",
  //           origin: leg.departure_id,
  //           destination: leg.arrival_id,
  //           date: leg.date,
  //           departure_token: departureToken,
  //           travel_class: form.travel_class,
  //           adults: form.adults,
  //           hl: form.hl,
  //           gl: form.gl,
  //           currency: form.currency
  //         }),
  //       });

  //       const data = await res.json();
  //       console.log(`Leg ${currentLeg + 1} API RESPONSE:`, data);

  //       if (!res.ok) throw new Error(data.error || "API error");

  //       setCurrentFlights(data.multi_city?.legs?.[currentLeg]?.flights || []);
  //     } catch (err) {
  //       console.error(err);
  //       setError(err.message);
  //     }
  //     setLoading(false);
  //   };

  //   fetchNextLeg();
  // }, [departureToken, currentLeg]);

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
        {error && <div className="error">{error}</div>}

        <form className="card search-card" onSubmit={(e) => {
          e.preventDefault();
          searchFlights();
        }}>
          <div className="custom-select">
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="1">Round Trip</option>
              <option value="2">One Way</option>
              <option value="3">Multi-City</option>
            </select>

            <select name="travel_class" value={form.travel_class} onChange={handleChange}>
              <option value="1">Economy</option>
              <option value="2">Premium</option>
              <option value="3">Business</option>
              <option value="4">First</option>
            </select>
          </div>
          <br />
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
                Add Trip
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
            <h3>
              Trip {currentLeg + 1} ·{" "}
              {multiCityLegs[currentLeg].origin} →
              {multiCityLegs[currentLeg].destination}
            </h3>

            {currentFlights.slice(0, 4).map((f, i) => (
              <div className="flight-row" key={i}>
                <div className="flight-main-info">
                  <span className="price">${f.price}</span>
                  <span>
                    {f.flights[0].departure_airport.id} →
                    {f.flights[f.flights.length - 1].arrival_airport.id}
                  </span>
                </div>

                <button
                  className="btn secondary"
                  onClick={() => handleSelectFlight(f)}
                  disabled={returnFlights[f.flights[0].flight_number] === "loading"}
                >
                  {returnFlights[f.flights[0].flight_number] === "loading"
                    ? "Loading…"
                    : "Select this flight"}
                </button>
              </div>
            ))}
          </section>
        )}

        {/* ONE-WAY and ROUND-TRIP */}
        {flights.map((f, i) => {
          const flightKey = f.flights[0].flight_number;

          return (
            <div key={i} className="card">
              {/* Departure flight info */}
              <div className="flight-row" key={i}>
                <div className="flight-main-info">
                  <span className="price">${f.price}</span>
                  <span>
                    {f.flights[0].departure_airport.id} →
                    {f.flights[f.flights.length - 1].arrival_airport.id}
                  </span>
                  <span>
                    {f.flights[0].departure_airport.time} →
                    {f.flights[f.flights.length - 1].arrival_airport.time}
                  </span>
                </div>
                <div className="flight-sub-info">
                  <span className="muted">
                    {f.flights.length - 1} stop(s)
                  </span>
                  <span className="muted"><img
                    src={f.flights[0].airline_logo}
                    style={{ width: '20px', height: '20px' }} // Optional styling
                  /> {f.flights[0].airline} {f.flights[0].flight_number}</span>
                </div>
              </div>

              {/* Button to fetch return flights */}
              {/* Show return button only for round-trip */}
              {form.type === "1" && (
                <div className="flight-row">
                  <button
                    className="btn secondary"
                    onClick={() => handleFlightReturn(f)}
                    disabled={returnFlights[f.flights[0].flight_number] === "loading"}
                  >
                    {returnFlights[f.flights[0].flight_number] === "loading"
                      ? "Loading…"
                      : "Show Return Flights"}
                  </button>
                </div>
              )}

              {/* Show return flights if loaded */}
              {Array.isArray(returnFlights[flightKey]) &&
                returnFlights[flightKey].map((rf, j) => (
                  <div className="flight-row return" key={j}>
                    <div className="flight-main-info">
                      <span className="price">${rf.price}</span>
                      <span>
                        {rf.flights[0].departure_airport.id} →
                        {rf.flights[rf.flights.length - 1].arrival_airport.id}
                      </span>
                      <span>
                        {rf.flights[0].departure_airport.time} →
                        {rf.flights[rf.flights.length - 1].arrival_airport.time}
                      </span>
                    </div>
                    <div className="flight-sub-info">
                      <span className="muted">
                        {rf.flights.length - 1} stop(s)
                      </span>
                      <span className="muted"><img
                        src={rf.flights[0].airline_logo}
                        style={{ width: '20px', height: '20px' }} // Optional styling
                      /> {rf.flights[0].airline} {rf.flights[0].flight_number}</span>
                    </div>
                  </div>
                ))}
            </div>
          );
        })}
      </main>

      <footer>&copy; 2026 Rachel Wang</footer>
    </div>
  );
}


export default App;