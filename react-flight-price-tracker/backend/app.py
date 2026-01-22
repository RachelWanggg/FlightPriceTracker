from flask import Flask, request, jsonify
import requests, os

app = Flask(__name__)
SERPAPI_KEY = os.environ.get("SERPAPI_KEY")

@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/search", methods=["POST"])
def search():
    data = request.json   # 👈 IMPORTANT

    flight_type = data.get("type")
    origin = data.get("origin")
    destination = data.get("destination")

    params = {
        "engine": "google_flights",
        "api_key": SERPAPI_KEY,
        "hl": data.get("hl", "en"),
        "gl": data.get("gl", "us"),
        "currency": data.get("currency", "USD"),
        "outbound_date": data.get("outbound_date"),
        "type": flight_type,
        "travel_class": data.get("travel_class", "1"),
        "adults": data.get("adults", "1"),
    }

    if flight_type in ["1", "2"]:
        params["departure_id"] = origin
        params["arrival_id"] = destination

    if flight_type == "1":
        params["return_date"] = data.get("return_date")

    r = requests.get("https://serpapi.com/search", params=params)
    result = r.json()

    if "error" in result:
        return jsonify({"error": result["error"]}), 400

    return jsonify(result.get("best_flights", []))


if __name__ == "__main__":
    app.run(debug=True)
    