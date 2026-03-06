import currencies from "../data/google-travel-currencies.json";

export default function SearchForm({
  form,
  handleChange,
  multiCities,
  handleMultiCityChange,
  addSegment,
  removeSegment,
  searchFlights,
  loading
}) {
  const currencyList = Object.entries(currencies).map(([code, name]) => ({ code, name }));
  return (
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
                <select
                  value={seg.currency || "USD"}
                  onChange={(e) =>
                    handleMultiCityChange(i, "currency", e.target.value)
                  }
                >
                  {currencyList.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name}
                    </option>
                  ))}
                </select>
                <button type="button" className="btn ghost" onClick={() => removeSegment(i)}>
                  Remove
                </button>
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
          <select
            name="currency"
            value={form.currency}
            onChange={handleChange}
          >
            {currencyList.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.code} - {curr.name}
              </option>
            ))}
          </select>
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
  );
}
