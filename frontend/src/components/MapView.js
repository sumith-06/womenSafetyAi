import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import axios from "axios";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

function ClickHandler({ setMarker }) {

  useMapEvents({
    click: async (e) => {

      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

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

      } catch (err) {
        console.error(err);
      }

    }
  });

  return null;
}

function HeatmapLayer() {

  const map = useMap();

  useEffect(() => {

 const heatData = [
  [17.3457, 78.5520, 1],   // LB Nagar high risk
  [17.3465, 78.5530, 1],
  [17.3470, 78.5515, 0.9],
  [17.3480, 78.5525, 0.8],

  [17.3688, 78.5247, 0.6], // Dilsukhnagar moderate
  [17.3692, 78.5255, 0.6],

  [17.3567, 78.5430, 0.7], // Kothapet
  [17.3555, 78.5420, 0.7],

  [17.3715, 78.5696, 0.3], // Nagole safer
  [17.3720, 78.5680, 0.3]
];

const heat = L.heatLayer(heatData, {
  radius: 50,
  blur: 30,
  maxZoom: 17,
  minOpacity: 0.5,
  gradient: {
    0.2: "green",
    0.4: "yellow",
    0.7: "orange",
    1.0: "red"
  }
}).addTo(map);

    return () => {
      map.removeLayer(heat);
    };

  }, [map]);

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

function MapView() {

  const center = [17.3457, 78.5520];

  const [marker, setMarker] = useState(null);

  return (

    <MapContainer center={center} zoom={13} style={{ height: "500px", width: "100%" }}>

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <HeatmapLayer />

      <LocateMe setMarker={setMarker} />

      <Legend />

      <ClickHandler setMarker={setMarker} />

      {marker && (
        <Marker position={marker.position}>
          <Popup openOn={true}>
            Risk Score: {marker.risk} <br />
            Status: {marker.status}
          </Popup>
        </Marker>
      )}

    </MapContainer>

  );
}

export default MapView;