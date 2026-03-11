import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

L.Marker.prototype.options.icon = DefaultIcon;
function MapView() {

  const position = [17.3457, 78.5520]; // LB Nagar Hyderabad

  return (
    <MapContainer center={position} zoom={13} style={{ height: "500px", width: "100%" }}>
      
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={position}>
        <Popup>
          LB Nagar Hyderabad
        </Popup>
      </Marker>

    </MapContainer>
  );
}

export default MapView;