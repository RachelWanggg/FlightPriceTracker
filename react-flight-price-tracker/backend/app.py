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


# 4. backend receives the request, processes it, and calls SerpAPI
@app.route("/search", methods=["POST"])
def search(): 
    try:
        data = request.json
        flight_type = data.get("type")

        # Multi-city flights require separate searches for each leg
        if flight_type == "3":
            return handle_multi_city_search(data)
        
        # Handle round trip or one way
        return handle_single_search(data, flight_type)

    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


def handle_multi_city_search(data):
    """Handle multi-city by searching each leg separately"""
    multi_city_json = data.get("multi_city_json")
    
    if not multi_city_json:
        return jsonify({"error": "multi_city_json is required for multi-city flights"}), 400
    
    try:
        legs = json.loads(multi_city_json)
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid multi_city_json format"}), 400
    
    if not legs or len(legs) < 2:
        return jsonify({"error": "At least 2 legs required for multi-city"}), 400
    
    all_legs_results = []
    
    # Search each leg separately
    for idx, leg in enumerate(legs):
        print(f"\n===== SEARCHING LEG {idx + 1}: {leg['departure_id']} → {leg['arrival_id']} =====")
        
        params = {
            "engine": "google_flights",
            "api_key": SERPAPI_KEY,
            "hl": data.get("hl", "en"),
            "gl": data.get("gl", "US"),
            "currency": data.get("currency", "USD"),
            "type": "2",  # Use one-way for each leg
            "travel_class": data.get("travel_class", "1"),
            "adults": data.get("adults", "1"),
            "departure_id": leg["departure_id"],
            "arrival_id": leg["arrival_id"],
            "outbound_date": leg["date"]
        }
        
        resp = requests.get("https://serpapi.com/search", params=params)
        result = resp.json()
        
        if "error" in result:
            return jsonify({"error": f"Error on leg {idx + 1}: {result['error']}"}), 400
        
        leg_flights = result.get("best_flights", []) + result.get("other_flights", [])
        
        all_legs_results.append({
            "leg_number": idx + 1,
            "route": f"{leg['departure_id']} → {leg['arrival_id']}",
            "date": leg["date"],
            "flights": leg_flights[:10],  # Limit to 5 options per leg
        })
        
        print(f"Found {len(leg_flights)} flights for leg {idx + 1}")
    
    return jsonify({
        "flights": [],
        "multi_city": {
            "legs": all_legs_results,
            "total_legs": len(legs)
        }
    })


def handle_single_search(data, flight_type):
    """Handle round trip or one-way search"""
    origin = data.get("origin")
    destination = data.get("destination")
    
    if not origin or not destination:
        return jsonify({"error": "origin and destination are required"}), 400
    
    params = {
        "engine": "google_flights",
        "api_key": SERPAPI_KEY,
        "hl": data.get("hl", "en"),
        "gl": data.get("gl", "US"),
        "currency": data.get("currency", "USD"),
        "type": flight_type,
        "travel_class": data.get("travel_class", "1"),
        "adults": data.get("adults", "1"),
        "departure_id": origin,
        "arrival_id": destination,
        "outbound_date": data.get("outbound_date")
    }
    
    if flight_type == "1":  # round trip
        params["return_date"] = data.get("return_date")
    
    # print(f"\n===== PARAMS SENT TO SERPAPI =====")
    # print(json.dumps(params, indent=2))
    
    resp = requests.get("https://serpapi.com/search", params=params)
    result = resp.json()
    
    if "error" in result:
        return jsonify({"error": result["error"]}), 400
    
    all_flights = result.get("best_flights", []) + result.get("other_flights", [])
    
    return jsonify({
        "type": "single" if flight_type == "2" else "round_trip",
        "flights": all_flights
    })


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5001)
