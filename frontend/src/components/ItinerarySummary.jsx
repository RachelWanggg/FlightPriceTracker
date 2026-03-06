export default function ItinerarySummary({
  selectedFlights,
  multiCities,
  form,
  onEditLeg,
  onRemoveLeg,
  onProceedToBooking
}) {
  if (!selectedFlights || selectedFlights.length === 0) {
    return null;
  }

  const isMultiCity = form.type === "3";
  const isRoundTrip = form.type === "1";

  const getCurrencyTotals = () => {
    const totals = {};
    selectedFlights.forEach((flight, index) => {
      if (!flight) return;
      const currency = getLegCurrency(index);
      totals[currency] = (totals[currency] || 0) + (flight.price || 0);
    });
    return totals;
  };

  const renderTotalPrices = () => {
    const totals = getCurrencyTotals();
    const formattedTotals = Object.entries(totals).map(([currency, amount]) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency
      }).format(amount);
    });

    return formattedTotals.join(" + ");
  };

  const getLegLabel = (index) => {
    if (isMultiCity) return `Leg ${index + 1}`;
    if (isRoundTrip) return index === 0 ? "Outbound" : "Return";
    return "Flight";
  };

  const getLegDate = (index) => {
    if (isMultiCity) return multiCities[index]?.date || "";
    if (isRoundTrip) return index === 0 ? form.outbound_date : form.return_date;
    return form.outbound_date;
  };

  const getLegCurrency = (index) => {
    if (isMultiCity) return multiCities[index]?.currency || "USD";
    return form.currency || "USD";
  };

  return (
    <section className="itinerary-summary">
      <h2>✈️ Your Selection</h2>
      
      <div className="selected-flights-container">
        {selectedFlights.map((flight, index) => {
          if (!flight) return null;
          
          const currency = getLegCurrency(index);
          const legPrice = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency
          }).format(flight.price);

          return (
            <div key={index} className="itinerary-card">
              <div className="itinerary-header">
                <h3>{getLegLabel(index)}</h3>
                <span className="leg-date">
                  {getLegDate(index)}
                </span>
              </div>

              <div className="itinerary-content">
                <div className="flight-route">
                  <div className="airport">
                    <span className="code">{flight.flights[0].departure_airport.id}</span>
                    <span className="time">{flight.flights[0].departure_airport.time}</span>
                  </div>
                  <div className="arrow">→</div>
                  <div className="airport">
                    <span className="code">
                      {flight.flights[flight.flights.length - 1].arrival_airport.id}
                    </span>
                    <span className="time">
                      {flight.flights[flight.flights.length - 1].arrival_airport.time}
                    </span>
                  </div>
                </div>

                <div className="flight-details">
                  <img
                    src={flight.flights[0].airline_logo}
                    alt={flight.flights[0].airline}
                    style={{ width: '20px', height: '20px', marginRight: '8px' }}
                  />
                  <span className="airline">{flight.flights[0].airline}</span>
                  <span className="flight-number">{flight.flights[0].flight_number}</span>
                  <span className="stops">
                    {flight.flights.length - 1} stop(s)
                  </span>
                </div>

                <div className="leg-price">
                  <strong>{legPrice}</strong>
                </div>
              </div>

              <div className="itinerary-actions">
                <button
                  className="btn secondary"
                  onClick={() => onEditLeg(index)}
                  title="Change this flight"
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn danger"
                  onClick={() => onRemoveLeg(index)}
                  title="Remove this flight"
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="itinerary-total">
        <h3>Total Price: <strong>{renderTotalPrices()}</strong></h3>
      </div>

      <div className="itinerary-booking">
        <button
          className="btn primary large"
          onClick={onProceedToBooking}
          title="Proceed to booking"
        >
          🎫 Proceed to Booking
        </button>
      </div>
    </section>
  );
}
