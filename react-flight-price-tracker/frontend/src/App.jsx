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
    hl: "en",
    gl: "US",
    currency: "USD",
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

  return (
    <div style={{ padding: 40 }}>
      <h1>✈️ Flight Search</h1>

      {error && <div style={{ color: "red" }}>{error}</div>}

      <form onSubmit={searchFlights}>
        <label>Trip Type:</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="1">Round trip</option>
          <option value="2">One way</option>
          <option value="3">Multi-city</option>
        </select>

        {form.type === "3" ? (
          <>
            {multiCities.map((seg, i) => (
              <div key={i}>
                <input
                  placeholder="From"
                  value={seg.departure_id}
                  onChange={(e) => handleMultiCityChange(i, "departure_id", e.target.value)}
                />
                <input
                  placeholder="To"
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
            <button type="button" onClick={addSegment}>+ Add Segment</button>
          </>
        ) : (
          <>
            <input name="origin" placeholder="From" value={form.origin} onChange={handleChange} />
            <input name="destination" placeholder="To" value={form.destination} onChange={handleChange} />
            <input type="date" name="outbound_date" value={form.outbound_date} onChange={handleChange} />
            {form.type === "1" && <input type="date" name="return_date" value={form.return_date} onChange={handleChange} />}
          </>
        )}

        <button type="submit">{loading ? "Searching..." : "Search Flights"}</button>
      </form>

      {flights.length > 0 && <h2>Results</h2>}
      {flights.map((f, i) => (
        <div key={i}>
          <strong>Price:</strong> {f.price} <br />
          {f.flights[0].departure_airport.name} → {f.flights[f.flights.length - 1].arrival_airport.name}
        </div>
      ))}
    </div>
  );
}

export default App;



