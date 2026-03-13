import random

def handler(request):

    lat = float(request.query.get("lat", 0))
    lon = float(request.query.get("lon", 0))

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