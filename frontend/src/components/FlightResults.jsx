import ItinerarySummary from "./ItinerarySummary";

export default function FlightResults({
    flights,
    multiCityLegs,
    multiCities,
    currentFlights,
    currentLeg,
    returnFlights,
    selectedFlights,
    form,
    user,
    onReturn,
    onSelectFlight,
    onSetAlert,
    onEditLeg,
    onRemoveLeg,
    onProceedToBooking
}) {
    const formatPrice = (price, isMultiCity = false) => {
        // For multi-city, use the currency from the current leg
        const currency = isMultiCity && multiCities[currentLeg]
            ? multiCities[currentLeg].currency || "USD"
            : form.currency || "USD";

        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency
        }).format(price);
    };
    return (
        <div className="results-container">
            {/* MULTI-CITY RESULTS */}
            {multiCityLegs && (
                <section className="results">
                    <h3>
                        Trip {currentLeg + 1} {" "}
                        {multiCityLegs[currentLeg].departure_id} →
                        {multiCityLegs[currentLeg].arrival_id}
                    </h3>

                    {currentFlights.slice(0, 4).map((f, j) => (
                        <div className="flight-row card" key={j}>
                            <div className="flight-main-info">
                                <span className="price">{formatPrice(f.price, true)}</span>
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
                                    style={{ width: '20px', height: '20px' }}
                                /> {f.flights[0].airline} {f.flights[0].flight_number}</span>
                            </div>
                            <div className="flight-actions flight-actions-column">
                                <button
                                    className="btn success"
                                    onClick={() => onSelectFlight(f)}
                                >
                                    ✓ Select this flight
                                </button>
                                <button
                                    className="btn primary"
                                    onClick={() => onSetAlert(f)}
                                    title={user ? "Set price alert" : "Login to set price alerts"}
                                >
                                    🔔 {user ? "Set Alert" : "Login for Alerts"}
                                </button>
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {/* ONE-WAY and ROUND-TRIP RESULTS */}
            <div className="flights-list">
                {flights.map((f, i) => {
                    const flightKey = f.flights[0].flight_number;

                    return (
                        <div key={i} className="card flight-result-card">
                            <div className="flight-row" key={i}>
                                <div className="flight-main-info">
                                    <span className="price">{formatPrice(f.price)}</span>
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
                                        style={{ width: '20px', height: '20px' }}
                                    /> {f.flights[0].airline} {f.flights[0].flight_number}</span>
                                </div>
                            </div>

                            <div className="flight-actions flight-actions-column">
                                {form.type === "1" && (
                                    <div className="button-group">
                                        <button
                                            className="btn success"
                                            onClick={() => onSelectFlight(f)}
                                            title="Select this outbound flight"
                                        >
                                            ✓ Select Outbound
                                        </button>
                                        <button
                                            className="btn secondary"
                                            onClick={() => onReturn(f)}
                                            disabled={returnFlights[f.flights[0].flight_number] === "loading"}
                                        >
                                            {returnFlights[f.flights[0].flight_number] === "loading"
                                                ? "Loading…"
                                                : "Show Return Flights"}
                                        </button>
                                    </div>
                                )}
                                {form.type === "2" && (
                               <div className="button-group">
                                    <button
                                        className="btn success"
                                        onClick={() => onSelectFlight(f)}
                                        title="Select this flight"
                                    >
                                        ✓ Select Flight
                                    </button>
                                    <button
                                        className="btn primary"
                                        onClick={() => onSetAlert(f)}
                                        title={user ? "Set price alert" : "Login to set price alerts"}
                                    >
                                        🔔 {user ? "Set Alert" : "Login for Alerts"}
                                    </button>
                                </div>
                                )}
                            </div>

                            {Array.isArray(returnFlights[flightKey]) &&
                                returnFlights[flightKey].map((rf, j) => (
                                    <div className="return-flight-container" key={j}>
                                        <div className="flight-row return">
                                            <div className="flight-main-info">
                                                <span className="price">{formatPrice(rf.price)}</span>
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
                                                    style={{ width: '20px', height: '20px' }}
                                                /> {rf.flights[0].airline} {rf.flights[0].flight_number}</span>
                                            </div>
                                            <button
                                                className="btn success"
                                                onClick={() => onSelectFlight(rf)}
                                                title="Select this return flight"
                                                
                                            >
                                                ✓ Select Return
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    );
                })}
            </div>

            {/* ITINERARY SUMMARY - Shows selected flights at the bottom */}
            {selectedFlights && selectedFlights.length > 0 && (
                <div className="results-summary-bottom">
                    <ItinerarySummary
                        selectedFlights={selectedFlights}
                        multiCities={multiCities}
                        form={form}
                        onEditLeg={onEditLeg}
                        onRemoveLeg={onRemoveLeg}
                        onProceedToBooking={onProceedToBooking}
                    />
                </div>
            )}
        </div>
    );
}    
