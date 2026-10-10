"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, ExternalLink, LoaderCircle } from "lucide-react";

export type RoutePoint = {
  name: string;
  lat: number;
  lon: number;
  category?: string;
  description?: string;
  image?: string;
};

declare global {
  interface Window {
    L?: {
      map: (id: HTMLElement, options?: Record<string, unknown>) => LeafletMap;
      tileLayer: (url: string, options?: Record<string, unknown>) => { addTo: (map: LeafletMap) => unknown };
      marker: (coords: [number, number], options?: Record<string, unknown>) => { addTo: (map: LeafletMap) => { bindPopup: (html: string) => unknown } };
      polyline: (coords: [number, number][], options?: Record<string, unknown>) => { addTo: (map: LeafletMap) => unknown; getBounds: () => unknown };
      latLngBounds: (coords: [number, number][]) => { pad: (n: number) => unknown };
    };
  }
}
type LeafletMap = {
  setView: (coords: [number, number], zoom: number) => LeafletMap;
  fitBounds: (bounds: unknown, options?: Record<string, unknown>) => LeafletMap;
  remove: () => void;
  invalidateSize: () => void;
};

type Props = {
  points: RoutePoint[];
  route?: [number, number][];
  title: string;
  loading?: boolean;
  emptyMessage?: string;
};

export default function RouteMap({ points, route = [], title, loading = false, emptyMessage = "Choose a day to see its mapped stops." }: Props) {
  const mapElement = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    let map: LeafletMap | undefined;
    let cancelled = false;
    const init = async () => {
      if (!mapElement.current || !points.length) return;
      try {
        if (!window.L) {
          if (!document.querySelector('link[data-roamly-leaflet]')) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            link.dataset.roamlyLeaflet = "true";
            document.head.appendChild(link);
          }
          await new Promise<void>((resolve, reject) => {
            const existing = document.querySelector<HTMLScriptElement>('script[data-roamly-leaflet]');
            if (existing && window.L) { resolve(); return; }
            const script = existing ?? document.createElement("script");
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.dataset.roamlyLeaflet = "true";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Map library could not load"));
            if (!existing) document.body.appendChild(script);
          });
        }
        if (cancelled || !window.L || !mapElement.current) return;
        const L = window.L;
        map = L.map(mapElement.current, { scrollWheelZoom: false }).setView([points[0].lat, points[0].lon], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        const coords: [number, number][] = points.map(p => [p.lat, p.lon]);
        points.forEach((point, index) => {
          const popup = '<strong>' + (index + 1) + '. ' + escapeHtml(point.name) + '</strong>' +
            (point.category ? '<br/><small>' + escapeHtml(point.category) + '</small>' : '') +
            '<br/><a target="_blank" rel="noreferrer" href="https://www.google.com/maps/search/?api=1&query=' + point.lat + ',' + point.lon + '">Open directions ↗</a>';
          L.marker([point.lat, point.lon]).addTo(map!).bindPopup(popup);
        });
        const line = route.length > 1 ? route : coords;
        if (line.length > 1) L.polyline(line, { color: "#2f7657", weight: 4, opacity: .85 }).addTo(map);
        map.fitBounds(L.latLngBounds([...coords, ...line]).pad(.18), { maxZoom: 14 });
        window.setTimeout(() => map?.invalidateSize(), 150);
      } catch {
        if (!cancelled) setMapError("The map couldn't load. You can still open each stop in Google Maps.");
      }
    };
    void init();
    return () => { cancelled = true; map?.remove(); };
  }, [points, route]);

  return <section className="real-route-map">
    <div className="real-route-map-heading"><div><span><MapPin size={14}/> LIVE MAP · {points.length} STOPS</span><h3>{title}</h3></div><a href={points.length ? "https://www.google.com/maps/dir/" + points.map(p => encodeURIComponent(p.name)).join("/") : "https://www.openstreetmap.org/"} target="_blank" rel="noreferrer">Open directions <ExternalLink size={13}/></a></div>
    {loading && <div className="route-map-loading"><LoaderCircle size={18}/> Finding real places near your destination…</div>}
    {!loading && points.length > 0 ? <div className="route-map-canvas" ref={mapElement} aria-label={title} /> : !loading ? <div className="route-map-empty">{emptyMessage}</div> : null}
    {mapError && <p className="route-map-error">{mapError}</p>}
    <p className="route-map-credit">Map data © OpenStreetMap contributors. Route and access may change; verify conditions before travelling.</p>
  </section>;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] ?? char));
}
