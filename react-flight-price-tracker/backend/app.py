from flask import Flask, request, jsonify
from flask_cors import CORS
import requests, os, json

app = Flask(__name__)
# Allow requests from your React dev server
CORS(app, origins=["http://localhost:5173"])

SERPAPI_KEY = os.environ.get("SERPAPI_KEY")


@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/search", methods=["POST"])
def search():
    try:
        data = request.json
        flight_type = data.get("type")

        params = {
            "engine": "google_flights",
            "api_key": SERPAPI_KEY,
            "hl": data.get("hl", "en"),
            "gl": data.get("gl", "us"),
            "currency": data.get("currency", "USD"),
            "type": flight_type,
            "travel_class": data.get("travel_class", "1"),
            "adults": data.get("adults", "1"),
        }

        # Multi-city flights
        if flight_type == "3":
            multi_city_json = data.get("multi_city_json")
            if not multi_city_json:
                return (
                    jsonify(
                        {"error": "multi_city_json is required for multi-city search"}
                    ),
                    400,
                )

            params = {
                "engine": "google_flights",
                "api_key": SERPAPI_KEY,
                "hl": data.get("hl", "en"),
                "gl": data.get("gl", "us"),
                "currency": data.get("currency", "USD"),
                "type": "3",
                "travel_class": data.get("travel_class", "1"),
                "adults": data.get("adults", "1"),
                "multi_city_json": multi_city_json,  # ✅ Send it as SerpAPI expects
            }

        # Round trip or one way
        else:
            origin = data.get("origin")
            destination = data.get("destination")
            if not origin or not destination:
                return jsonify({"error": "origin and destination are required"}), 400
            params["departure_id"] = origin
            params["arrival_id"] = destination
            params["outbound_date"] = data.get("outbound_date")
            if flight_type == "1":  # round trip
                params["return_date"] = data.get("return_date")

        # Call SerpAPI
        resp = requests.get("https://serpapi.com/search", params=params)
        result = resp.json()

        if "error" in result:
            return jsonify({"error": result["error"]}), 400

        # Return best flights
        return jsonify({"flights": result.get("best_flights", [])})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5001)
