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

    risk = random.choice([10, 20, 35, 45, 65, 80])

    if lat > 17.34 and lon > 78.54:
        risk = random.randint(60, 90)
    else:
        risk = random.randint(10, 40)

    status = "Safe"
    if risk > 60:
        status = "High Risk"
    elif risk > 30:
        status = "Moderate Risk"

    return {
        "risk_score": risk,
        "status": status
    }
from pydantic import BaseModel

class Report(BaseModel):
    lat: float
    lon: float
    description: str


reports = []

@app.post("/report")
def report_area(report: Report):

    reports.append(report)

    return {
        "message": "Report saved",
        "total_reports": len(reports)
    }
 