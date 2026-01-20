from flask import Flask, render_template, request
import requests

from keys import SERPAPI_KEY

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def index():
    flight_data = []
    if request.method == "POST":
        type = request.form.get("type")

        hl = request.form.get("hl")
        gl = request.form.get("gl")
        currency = request.form.get("currency")
        outbound_date = request.form.get("outbound_date")

        travel_class = request.form.get("travel_class")
        adults = request.form.get("adults")

        origin = request.form.get("origin")
        destination = request.form.get("destination")


        params = {
            "engine": "google_flights",
            "hl":hl,
            "gl":gl,
            "outbound_date": outbound_date,
            "type": type,
            "travel_class": travel_class,
            "api_key": SERPAPI_KEY,
            "currency": currency,
            "adults": adults
        }

        if type in ["1", "2"]:
            params["departure_id"] = origin
            params["arrival_id"] = destination

        if type == "1":
            params["return_date"] = request.form.get("return_date")
        
        elif type == "3":
            params["multi_city_json"] = request.form.get("multi_city_json")

        r = requests.get("https://serpapi.com/search", params=params)
        data = r.json()
        if 'error' in data:
            return render_template("index.html", error = data['error'])

        flight_data = data.get("best_flights", [])

    return render_template("index.html", flights = flight_data)

if __name__ == "__main__":
    app.run(debug=True)
    