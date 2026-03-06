import { useState } from "react";
import { useAuth } from "../context/authContext";
import { db } from "../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import SearchForm from "../components/SearchForm";
import FlightResults from "../components/FlightResults";
import { searchFlightsAPI, getReturnFlightsAPI, getNextLegFlightsAPI } from "../services/flightService";

export default function SearchPage({ onLoginRequired }) {
  const { user } = useAuth();

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
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [currentLeg, setCurrentLeg] = useState(0);
  const [multiCityLegs, setMultiCityLegs] = useState(null);
  const [currentFlights, setCurrentFlights] = useState([]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleMultiCityChange = (index, field, value) => {
    const updated = [...multiCities];
    updated[index][field] = value;
    setMultiCities(updated);
  };

  const addSegment = () => setMultiCities([...multiCities, { departure_id: "", arrival_id: "", date: "" }]);

  const removeSegment = (index) => {
    const updated = multiCities.filter((_, i) => i !== index);
    setMultiCities(updated);
  }

  // ----- Search function:
  const searchFlights = async (payloadOverride = null) => {
    setLoading(true);
    setError(null);
    setFlights([]);
    setMultiCityLegs(null);
    setCurrentFlights([]);
    setSelectedFlights([]);
    setCurrentLeg(0);
    setSelectedCurrency(form.currency);

    try {
      const payload = payloadOverride || { ...form };

      if (form.type === "3" && !payload.departure_token) {
        payload.multi_city_json = JSON.stringify(multiCities);
      }
      console.log("SEARCH PAYLOAD:", payload);

      const data = await searchFlightsAPI(payload);
      console.log("API RESPONSE:", data);

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
      const payload = {
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
      };

      const data = await getReturnFlightsAPI(payload);

      if (data.flights) {
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

  const handleSelectFlight = async (flight) => {
    // Handle selection for different trip types
    // Multi-city flow: select per currentLeg and fetch next leg
    if (form.type === "3") {
      const newSelectedFlights = [...selectedFlights];
      newSelectedFlights[currentLeg] = flight;
      setSelectedFlights(newSelectedFlights);

      // If we've selected all legs, clear current flights
      if (newSelectedFlights.filter(Boolean).length >= multiCities.length) {
        console.log("All multi-city legs selected!");
        setCurrentFlights([]);
        return;
      }

      // Move to next leg and fetch flights for it
      const nextLegIndex = currentLeg + 1;
      if (nextLegIndex >= multiCities.length) {
        setCurrentLeg(currentLeg);
        return;
      }

      const nextLeg = multiCities[nextLegIndex];
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

        const data = await getNextLegFlightsAPI(payload);

        setCurrentFlights(data.multi_city?.legs?.[nextLegIndex]?.flights || []);
        setCurrentLeg(nextLegIndex);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }

      return;
    }

    // Round-trip flow: keep outbound at index 0 and return at index 1
    if (form.type === "1") {
      const dep = flight.flights[0].departure_airport?.id;
      const arr = flight.flights[flight.flights.length - 1].arrival_airport?.id;

      const isReturn = dep === form.destination || arr === form.origin;

      const newSelectedFlights = [...selectedFlights];
      if (isReturn) {
        // place return at index 1
        newSelectedFlights[1] = flight;
      } else {
        // place outbound at index 0
        newSelectedFlights[0] = flight;
      }

      setSelectedFlights(newSelectedFlights);
      // if both legs present, clear currentFlights to end selection
      if (newSelectedFlights[0] && newSelectedFlights[1]) {
        setCurrentFlights([]);
      }

      return;
    }

    // One-way flow: simple single selection
    const newSelectedFlights = [...selectedFlights];
    newSelectedFlights[0] = flight;
    setSelectedFlights(newSelectedFlights);
  };

  const handleEditLeg = (legIndex) => {
    setCurrentLeg(legIndex);
    setCurrentFlights([]);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemoveLeg = (legIndex) => {
    const newSelectedFlights = [...selectedFlights];
    newSelectedFlights[legIndex] = null;
    setSelectedFlights(newSelectedFlights);
    setCurrentLeg(legIndex);
    setCurrentFlights([]);
  };

  const handleProceedToBooking = () => {
    // Validate selection based on trip type
    if (form.type === "3") {
      // multi-city: every leg must have a selected flight
      const allSelected = multiCities.every((_, idx) => selectedFlights[idx]);
      if (!allSelected) {
        alert("Please select flights for all legs");
        return;
      }
    } else if (form.type === "1") {
      // round-trip: need both outbound and return
      if (!selectedFlights[0] || !selectedFlights[1]) {
        alert("Please select both outbound and return flights");
        return;
      }
    } else {
      // one-way: need a single selection
      if (!selectedFlights[0]) {
        alert("Please select a flight");
        return;
      }
    }

    // TODO: Navigate to booking page or open booking modal
    console.log("Proceeding to booking with:", selectedFlights);
    alert("Booking feature coming soon!");
  };

  const handleSetAlert = async (flight) => {
    if (!user) {
      onLoginRequired();
      return;
    }

    try {
      console.log("Setting alert for flight:", flight);
      console.log("User:", user.uid);

      const alertData = {
        userId: user.uid,
        email: user.email,
        origin: form.origin,
        destination: form.destination,
        flightNumber: flight.flights[0].flight_number,
        airline: flight.flights[0].airline,
        currentPrice: flight.price,
        departureDate: form.outbound_date,
        returnDate: form.return_date || null,
        createdAt: new Date(),
        active: true,
      };

      console.log("Alert data:", alertData);

      const docRef = await addDoc(collection(db, "priceAlerts"), alertData);
      console.log("Alert saved with ID:", docRef.id);

      alert("Price alert set! You'll be notified of price changes.");
    } catch (err) {
      console.error("Error setting alert:", err);
      alert(`Failed to set alert: ${err.message}`);
    }
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
    <>
      {error && <div className="error">{error}</div>}

      <SearchForm
        form={form}
        handleChange={handleChange}
        multiCities={multiCities}
        handleMultiCityChange={handleMultiCityChange}
        addSegment={addSegment}
        removeSegment={removeSegment}
        searchFlights={searchFlights}
        loading={loading}
      />

      <FlightResults
        flights={flights}
        multiCityLegs={multiCityLegs}
        multiCities={multiCities}
        currentFlights={currentFlights}
        currentLeg={currentLeg}
        returnFlights={returnFlights}
        selectedFlights={selectedFlights}
        form={form}
        user={user}
        onReturn={handleFlightReturn}
        onSelectFlight={handleSelectFlight}
        onSetAlert={handleSetAlert}
        onEditLeg={handleEditLeg}
        onRemoveLeg={handleRemoveLeg}
        onProceedToBooking={handleProceedToBooking}
      />
    </>
  );
}
