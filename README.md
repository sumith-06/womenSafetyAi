# AI Women Safety Map – Hyderabad

## Project Demo

![Women Safety Map](screenshots/map-demo.png)

An AI-powered safety navigation system that helps users identify unsafe areas, view risk scores, and find safer routes using heatmap-based risk analysis.

This project was built as part of a hackathon to improve urban safety using geospatial data and AI-based risk prediction.

---

## Features

• Interactive safety heatmap of Hyderabad  
• AI risk prediction when clicking any location  
• Safe route navigation between source and destination  
• SOS emergency alert with live location  
• Unsafe area reporting system  
• Real-time location detection

---

## Tech Stack

Frontend  
- React.js
- React Leaflet
- Leaflet Heatmap

Backend  
- FastAPI
- Python
- Uvicorn

Routing API  
- OpenStreetMap
- OSRM routing service

---

## Installation

### 1. Clone repository


git clone https://github.com/sumith-06/womenSafetyAi.git

cd womenSafetyAi


---

### 2. Start Backend


cd backend

pip install fastapi uvicorn

uvicorn main:app --reload


Backend will run at:


http://127.0.0.1:8000


---

### 3. Start Frontend


cd frontend

npm install

npm start


Frontend runs at:


http://localhost:3000

---

## How it Works

1. User clicks any location on the map  
2. Frontend sends coordinates to FastAPI backend  
3. Backend calculates safety risk score  
4. Risk score and status appear as popup  
5. Heatmap visualizes safe and unsafe zones  
6. Safe route feature avoids high-risk zones

---

## Example Features

Risk Prediction Popup

• Click any location to view safety score  
• Displays **Safe / Moderate Risk / High Risk**

SOS Emergency

• Sends user's live location link  
• Opens Google Maps location

Safe Route Navigation

• Select source and destination  
• Route generated using OSRM API

---

## Future Improvements

• Crime dataset integration  
• Machine learning risk prediction model  
• Real-time police data integration  
• Night-time safety scoring  
• Mobile application version

---

## Author

Sumith

GitHub:  
[https://github.com/sumith-06](https://github.com/sumith-06)
