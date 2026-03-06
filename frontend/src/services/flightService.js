const API_BASE_URL = "http://127.0.0.1:5001";

/**
 * Search for flights based on the provided payload
 * Handles one-way, round-trip, and multi-city searches
 */
export async function searchFlightsAPI(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "API error");
    }

    return data;
  } catch (err) {
    console.error("Search flights error:", err);
    throw err;
  }
}

/**
 * Fetch return flights for a selected outbound flight
 */
export async function getReturnFlightsAPI(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "API error");
    }

    return data;
  } catch (err) {
    console.error("Get return flights error:", err);
    throw err;
  }
}

/**
 * Fetch next leg flights for multi-city search
 */
export async function getNextLegFlightsAPI(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "API error");
    }

    return data;
  } catch (err) {
    console.error("Get next leg flights error:", err);
    throw err;
  }
}
