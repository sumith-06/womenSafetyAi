import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useState } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";

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

function MapView() {

  const center = [17.3457, 78.5520];

  const [marker, setMarker] = useState(null);

  return (

    <MapContainer center={center} zoom={13} style={{ height: "500px", width: "100%" }}>

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

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