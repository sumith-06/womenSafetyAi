from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

# Allow React frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow all origins (fine for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Women Safety API running"}


@app.get("/risk")
def get_risk(lat: float, lon: float):

    risk = random.randint(0, 100)

    status = "Safe"
    if risk > 60:
        status = "High Risk"
    elif risk > 30:
        status = "Moderate Risk"

    return {
        "risk_score": risk,
        "status": status
    }