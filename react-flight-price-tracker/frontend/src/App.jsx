import { useState } from "react";

function App() {
  const [form, setForm] = useState({
    type: "2",
    travel_class: "1",
    adults: "1",
    origin: "",
    destination: "",
    outbound_date: "",
    return_date: "",
    gl: "",
    hl: "",
    currency: "USD",
  });

  const [multiCities, setMultiCities] = useState([
    { origin: "", destination: "", date: "" },
    { origin: "", destination: "", date: "" },
  ]);
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMultiCityChange = (index, field, value) => {
    const updated = [...multiCities];
    updated[index][field] = value;
    setMultiCities(updated);
  };

  const addMultiCitySegment = () => {
    setMultiCities([...multiCities, { origin: "", destination: "", date: "" }]);
  };

  const removeMultiCitySegment = (index) => {
    if (multiCities.length > 2) {
      setMultiCities(multiCities.filter((_, i) => i !== index));
    }
  };

  const searchFlights = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let payload = { ...form };

      // Convert multi-city data to JSON string if needed
      if (form.type === "3") {
        payload.multi_city_json = JSON.stringify(multiCities);
      }

      const res = await fetch("http://localhost:5000/api/search", {
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

  return (
    <div style={{ padding: 40 }}>
      <h1>✈️ Flight Search</h1>

      {error && <div style={{ color: "red", marginBottom: 20 }}>{error}</div>}

      <form onSubmit={searchFlights}>
        <div style={{ marginBottom: 15 }}>
          <label>Trip Type:</label>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="1">Round trip</option>
            <option value="2">One way</option>
            <option value="3">Multi-city</option>
          </select>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>Class:</label>
          <select
            name="travel_class"
            value={form.travel_class}
            onChange={handleChange}
          >
            <option value="1">Economy</option>
            <option value="2">Premium Economy</option>
            <option value="3">Business</option>
            <option value="4">First Class</option>
          </select>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>Adults:</label>
          <input
            type="number"
            name="adults"
            min="1"
            value={form.adults}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>Currency:</label>
          <input
            name="currency"
            placeholder="USD"
            value={form.currency}
            onChange={handleChange}
          />
        </div>

        {/* Multi-city section */}
        {form.type === "3" ? (
          <div style={{ marginBottom: 20, border: "1px solid #ccc", padding: 15 }}>
            <h3>Where did you want to go?</h3>
            {multiCities.map((segment, index) => (
              <div
                key={index}
                style={{
                  marginBottom: 15,
                  padding: 10,
                  border: "1px solid #ddd",
                  borderRadius: 5,
                }}
              >
                <label>Segment {index + 1}:</label>
                <input
                  placeholder="From (e.g., SFO)"
                  value={segment.origin}
                  onChange={(e) =>
                    handleMultiCityChange(index, "origin", e.target.value)
                  }
                  style={{ marginRight: 10 }}
                />
                <input
                  placeholder="To (e.g., LAX)"
                  value={segment.destination}
                  onChange={(e) =>
                    handleMultiCityChange(index, "destination", e.target.value)
                  }
                  style={{ marginRight: 10 }}
                />
                <input
                  type="date"
                  value={segment.date}
                  onChange={(e) =>
                    handleMultiCityChange(index, "date", e.target.value)
                  }
                  style={{ marginRight: 10 }}
                />
                {multiCities.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeMultiCitySegment(index)}
                    style={{ color: "red" }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addMultiCitySegment}
              style={{ marginTop: 10 }}
            >
              + Add Segment
            </button>
          </div>
        ) : (
          <>
            {/* Round trip or One way section */}
            <div style={{ marginBottom: 15 }}>
              <label>From:</label>
              <input
                name="origin"
                placeholder="SFO"
                value={form.origin}
                onChange={handleChange}
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label>To:</label>
              <input
                name="destination"
                placeholder="LAX"
                value={form.destination}
                onChange={handleChange}
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label>Departure Date:</label>
              <input
                type="date"
                name="outbound_date"
                value={form.outbound_date}
                onChange={handleChange}
              />
            </div>

            {form.type === "1" && (
              <div style={{ marginBottom: 15 }}>
                <label>Return Date:</label>
                <input
                  type="date"
                  name="return_date"
                  value={form.return_date}
                  onChange={handleChange}
                />
              </div>
            )}
          </>
        )}

        <button type="submit">
          {loading ? "Searching..." : "Search Flights"}
        </button>
      </form>

      <hr />

      {flights.length > 0 && <h2>Results</h2>}
      {flights.map((flight, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <strong>Price:</strong> {flight.price} <br />
          {flight.flights[0].departure_airport.name}
          {" → "}
          {flight.flights[flight.flights.length - 1].arrival_airport.name}
        </div>
      ))}
    </div>
  );
}

export default App;

