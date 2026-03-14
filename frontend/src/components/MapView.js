import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import axios from "axios";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { Polyline } from "react-leaflet";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

function ClickHandler({
  setMarker,
  setHeatData,
  routeMode,
  source,
  destination,
  setSource,
  setDestination,
  reportMode,
  setReportLocation
}){

  useMapEvents({
    click: async (e) => {

      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      if (routeMode) {

  if (!source) {
    setSource([lat, lng]);
    alert("Source selected. Now click destination.");
    return;
  }

  if (!destination) {
    setDestination([lat, lng]);
    return;
  }
}

      if (reportMode) {
  setReportLocation([lat, lng]);
  setMarker(null);   // remove marker while reporting
  return;
}

      console.log("Clicked:", lat, lng);

      try {

  const res = await axios.get("http://127.0.0.1:8000/risk", {
    params: { lat: lat, lon: lng }
  });

  console.log("Risk response:", res.data);

  setMarker({
    position: [lat, lng],
    risk: res.data.risk_score,
    status: res.data.status
  });

  const intensity = res.data.risk_score / 100;

  setHeatData(prev => [...prev, [lat, lng, intensity]]);

} 
catch (err) {
  console.error(err);
}

    }
  });

  return null;
}

function HeatmapLayer({ heatData }) {

  const map = useMap();

  useEffect(() => {

    if (!heatData.length) return;

    const heat = L.heatLayer(heatData, {
      radius: 85,
blur: 45,
      maxZoom: 17,
      gradient: {
        0.2: "green",
        0.4: "yellow",
        0.6: "orange",
        0.8: "red"
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };

  }, [heatData, map]);

  return null;
}
function Legend() {

  const map = useMap();

  useEffect(() => {

    const legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {

      const div = L.DomUtil.create("div", "info legend");

      div.innerHTML = `
        <div style="
          background:white;
          padding:10px;
          border-radius:8px;
          box-shadow:0 0 10px rgba(0,0,0,0.2);
          font-size:14px;
        ">
          <b>Safety Levels</b><br><br>
          <span style="color:red;">⬤</span> High Risk<br>
          <span style="color:orange;">⬤</span> Moderate Risk<br>
          <span style="color:green;">⬤</span> Safe Area
        </div>
      `;

      return div;
    };

    legend.addTo(map);

    return () => {
  legend.remove();
};

  }, [map]);

  return null;
}

function LocateMe({ setMarker }) {

  const map = useMap();

  const locate = () => {

    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      map.setView([lat, lng], 15);

      try {

        const res = await axios.get("http://127.0.0.1:8000/risk", {
          params: { lat: lat, lon: lng }
        });

        setMarker({
          position: [lat, lng],
          risk: res.data.risk_score,
          status: res.data.status
        });

      } catch (err) {
        console.error(err);
      }

    });

  };

  return (
    <button
      onClick={locate}
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 1000,
        padding: "8px 12px",
        background: "#1976d2",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
      }}
    >
      Locate Me
    </button>
  );
}

function calculateRiskPenalty(lat, lon, heatData) {

  let penalty = 0;

  for (let zone of heatData) {

    const dist = Math.sqrt(
      Math.pow(lat - zone[0], 2) +
      Math.pow(lon - zone[1], 2)
    );

    if (dist < 0.01) {
      penalty += zone[2] * 100;
    }

  }

  return penalty;
}



function MapView() {

  const center = [17.3457, 78.5520];

  const [marker, setMarker] = useState(null);

  const [reportMode, setReportMode] = useState(false);
const [reportLocation, setReportLocation] = useState(null);
  const [source, setSource] = useState(null);
const [destination, setDestination] = useState(null);
const [route, setRoute] = useState(null);
const [routeMode, setRouteMode] = useState(false);


const getRoute = async () => {

  if (!source || !destination) return;

  const url = `https://router.project-osrm.org/route/v1/driving/${source[1]},${source[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`;

  try {

    const res = await axios.get(url);

    const coords = res.data.routes[0].geometry.coordinates;

    const routeLatLng = coords.map(c => [c[1], c[0]]);

    setRoute(routeLatLng);

  } catch (err) {

    console.error("Route error:", err);
    alert("Could not calculate route");

  }
};

useEffect(() => {
  if (source && destination) {
    getRoute();
  }
}, [source, destination]);
 const [heatData, setHeatData] = useState([]);

useEffect(() => {
  setHeatData([

    // 🔴 LB Nagar (High Risk)
    [17.3457, 78.5520, 1],
    [17.3465, 78.5528, 0.95],
    [17.3470, 78.5515, 0.9],

    // 🟠 Kothapet
    [17.3567, 78.5430, 0.8],
    [17.3575, 78.5425, 0.75],

    // 🟡 Dilsukhnagar
    [17.3688, 78.5247, 0.65],
    [17.3695, 78.5255, 0.6],

    // 🟢 Nagole (safer)
    [17.3715, 78.5696, 0.4],
    [17.3720, 78.5685, 0.35],

    // 🔴 Charminar area
    [17.3616, 78.4747, 0.9],
    [17.3625, 78.4755, 0.85],

    // 🟠 Secunderabad
    [17.4399, 78.4983, 0.75],
    [17.4405, 78.4970, 0.7],

    // 🟡 Ameerpet
    [17.4375, 78.4483, 0.65],
    [17.4380, 78.4470, 0.6],

    // 🟢 Gachibowli (safer)
    [17.4401, 78.3489, 0.4],
    [17.4410, 78.3495, 0.35],

    // 🟠 Kukatpally
    [17.4948, 78.3996, 0.7],
    [17.4955, 78.4005, 0.65],

    // 🔴 Uppal
    [17.4050, 78.5591, 0.9],
    [17.4060, 78.5585, 0.85],

  ]);
}, []);

return (

<div>

<button
  onClick={() => {

    if (!navigator.geolocation) {
      alert("Location not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {

      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      const mapLink = `https://www.google.com/maps?q=${lat},${lon}`;

      const message =
`🚨 SOS EMERGENCY ALERT

My current location:
${mapLink}

Please help me immediately.`;

      alert(message);

      window.open(mapLink, "_blank");

    });

  }}
  style={{
    padding: "12px 20px",
    background: "red",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    marginBottom: "10px",
    cursor: "pointer"
  }}
>
🚨 SOS EMERGENCY
</button>

<MapContainer center={center} zoom={13} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

     <HeatmapLayer heatData={heatData} />
      
    <button
onClick={()=>{
setSource(null);
setDestination(null);
setRoute(null);
setRouteMode(false);
}}
>
Reset Route
</button>
      <LocateMe setMarker={setMarker} />

      <Legend />

  <ClickHandler
  setMarker={setMarker}
  setHeatData={setHeatData}
  routeMode={routeMode}
  source={source}
  destination={destination}
  setSource={setSource}
  setDestination={setDestination}
  reportMode={reportMode}
  setReportLocation={setReportLocation}
/>

{route && (
  <Polyline
    positions={route}
    pathOptions={{ color: "blue", weight: 5 }}
  />
)}

{source && <Marker position={source}><Popup>Source</Popup></Marker>}
{destination && <Marker position={destination}><Popup>Destination</Popup></Marker>}


      {marker && (
        <Marker position={marker.position}>
          <Popup openOn={true}>
            Risk Score: {marker.risk} <br />
            Status: {marker.status}
          </Popup>
        </Marker>
      )}

      {reportLocation && (
  <div style={{
    position: "absolute",
    top: "120px",
    right: "10px",
    background: "white",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
    zIndex: 1000
  }}>

    <h4>Report Unsafe Area</h4>

    <textarea
      id="reportText"
      placeholder="Describe the issue..."
      style={{ width: "200px", height: "60px" }}
    />

    <br /><br />

    <button
      onClick={async () => {

        const text = document.getElementById("reportText").value;

        await axios.post("http://127.0.0.1:8000/report", {
          lat: reportLocation[0],
          lon: reportLocation[1],
          description: text
        });

        alert("Report submitted!");

        setReportLocation(null);
        setReportMode(false);

      }}
    >
Submit
    </button>

  </div>
)}

    </MapContainer>

<div style={{
  marginTop: "10px",
  display: "flex",
  gap: "10px"
}}>

<button
  onClick={() => setReportMode(true)}
  style={{
    padding: "8px 12px",
    background: "#d32f2f",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }}
>
Report Unsafe Area
</button>

<button
  onClick={() => setRouteMode(true)}
  style={{
    padding: "8px 12px",
    background: "#388e3c",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }}
>
Find Safe Route
</button>

</div>

</div>

  );
}

export default MapView;