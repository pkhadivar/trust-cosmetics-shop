"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// آیکون سفارشی
const customIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style="height: 40px; width: 40px; fill: #D4AF37; filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.3));"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>`,
  className: "custom-pin",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

export default function ContactMap() {
  // مختصات دقیق تبدیل‌شده از روی عکس گوگل‌مپ شما
  const position: [number, number] = [35.782111, 51.435916];

  return (
    <div className="h-[400px] w-full rounded-3xl overflow-hidden border border-border z-0 relative">
      <MapContainer 
        center={position} 
        zoom={16} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={customIcon}>
          <Popup className="font-sans">
            <div className="text-right rtl flex flex-col gap-1">
              <strong className="text-sm font-bold">دفتر مرکزی تراست</strong>
              <span className="text-xs text-gray-600">خیابان شریعتی، پلاک ۱۶۹۸</span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}