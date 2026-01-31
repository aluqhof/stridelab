"use client";

import { useEffect, useRef, useState } from "react";
import polyline from "@mapbox/polyline";

interface ActivityMapProps {
  polyline: string;
  className?: string;
}

export function ActivityMap({ polyline: encodedPolyline, className = "" }: ActivityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    setMapKey(k => k + 1);
  }, [encodedPolyline]);

  useEffect(() => {
    if (!encodedPolyline || !mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const timer = setTimeout(() => {
      if (!mapRef.current) return;

      import("leaflet").then((L) => {
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        const coordinates = polyline.decode(encodedPolyline);
        if (coordinates.length === 0 || !mapRef.current) return;

        const lats = coordinates.map((c) => c[0]);
        const lngs = coordinates.map((c) => c[1]);
        const bounds = L.latLngBounds(
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)]
        );

        try {
          const map = L.map(mapRef.current, {
            scrollWheelZoom: false,
            dragging: false,
            zoomControl: false,
            attributionControl: false,
          });

          mapInstanceRef.current = map;

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
          map.fitBounds(bounds, { padding: [30, 30] });

          L.polyline(coordinates as [number, number][], {
            color: "#f97316",
            weight: 4,
            opacity: 0.9,
            lineCap: "round",
            lineJoin: "round",
          }).addTo(map);

          const startPoint = coordinates[0] as [number, number];
          L.circleMarker(startPoint, {
            radius: 6,
            color: "#22c55e",
            fillColor: "#22c55e",
            fillOpacity: 1,
            weight: 2,
          }).addTo(map);

          const endPoint = coordinates[coordinates.length - 1] as [number, number];
          L.circleMarker(endPoint, {
            radius: 6,
            color: "#ef4444",
            fillColor: "#ef4444",
            fillOpacity: 1,
            weight: 2,
          }).addTo(map);
        } catch (e) {
          console.warn("Map initialization error:", e);
        }
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [encodedPolyline, mapKey]);

  if (!encodedPolyline) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center h-64 ${className}`}>
        <p className="text-gray-400 text-sm">No route data</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden h-64 ${className}`}>
      <div
        key={mapKey}
        ref={mapRef}
        style={{ height: "100%", width: "100%", background: "#f3f4f6" }}
      />
    </div>
  );
}
