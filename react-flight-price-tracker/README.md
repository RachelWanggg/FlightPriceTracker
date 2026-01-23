# ✈️ FlightPriceTracker

A full-stack flight search application that allows users to search for flights using multiple trip types: round trip, one-way, and multi-city flights. The app uses the SerpAPI Google Flights API to fetch real-time flight data.

## Features

- 🔄 **Round Trip Flights** - Search for flights with outbound and return dates
- 🛫 **One-Way Flights** - Single leg flight searches
- 🌍 **Multi-City Flights** - Search multiple flight segments in one query
- 💱 **Multiple Currencies** - Support for different currency options
- ✨ **Class Selection** - Economy, Premium Economy, Business, and First Class options
- 🌐 **International Support** - Language and region localization

## Tech Stack

- **Frontend**: React with Vite
- **Backend**: Flask with Flask-CORS
- **API**: SerpAPI (Google Flights)
- **Styling**: Inline CSS

## Prerequisites

Before you begin, ensure you have:
- **Node.js** (v14+) and npm
- **Python** (v3.8+)
- **SerpAPI Key** - Get it from [serpapi.com](https://serpapi.com)

## Installation

### 1. Clone or Navigate to the Project

```bash
cd FlightPriceTracker/react-flight-price-tracker
```

### 2. Set Up Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
echo "SERPAPI_KEY=your_serpapi_key_here" > backend/.env
```

Or set it as an environment variable:

```bash
export SERPAPI_KEY=your_serpapi_key_here
```

### 3. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Running the Project

### Start the Backend Server

```bash
cd backend
python app.py
```

The Flask server will run on `http://127.0.0.1:5000`

### Start the Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The Vite dev server will typically run on `http://localhost:5173`

### Access the Application

Open your browser and navigate to the frontend URL (usually `http://localhost:5173`)

## API Endpoints

### Health Check
- **GET** `/` - Returns `{"status": "ok"}`

### Search Flights
- **POST** `/search` - Search for flights

**Request Body:**
```json
{
  "type": "2",
  "origin": "SFO",
  "destination": "LAX",
  "outbound_date": "2024-03-15",
  "return_date": "2024-03-22",
  "travel_class": "1",
  "adults": "1",
  "currency": "USD",
  "hl": "en",
  "gl": "us"
}
```

**Multi-city Request:**
```json
{
  "type": "3",
  "multi_city_json": "[{\"origin\": \"SFO\", \"destination\": \"LAX\", \"date\": \"2024-03-15\"}, {\"origin\": \"LAX\", \"destination\": \"JFK\", \"date\": \"2024-03-22\"}]",
  "travel_class": "1",
  "adults": "1",
  "currency": "USD"
}
```

## Project Structure

```
FlightPriceTracker/react-flight-price-tracker/
├── backend/
│   ├── app.py              # Flask backend server
│   ├── requirements.txt    # Python dependencies
│   └── __pycache__/
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── main.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json       # Node dependencies
│   ├── vite.config.js
│   ├── index.html
│   └── public/
└── README.md
```

## Configuration

### Backend Dependencies

Check `backend/requirements.txt`:
```
Flask
Flask-CORS
requests
```

### Frontend Dependencies

Check `frontend/package.json` for React and Vite configurations.

## Troubleshooting

### SERPAPI_KEY not found
- Ensure the environment variable is set: `echo $SERPAPI_KEY`
- Check that `.env` file exists in the `backend/` directory with the correct key

### CORS Issues
- The backend includes CORS headers. Ensure the frontend is calling `http://127.0.0.1:5000`

### Port Already in Use
- Backend: Change the port in `app.py` → `app.run(debug=True, port=5001)`
- Frontend: Vite will prompt to use another port if 5173 is busy

## Development Notes

- The frontend validation ensures multi-city segments are complete before submitting
- The backend returns flight data in the format: `{"flights": [...]}`
- SerpAPI may have rate limits; check your account for usage

## License

This project is open source and available for educational purposes.
