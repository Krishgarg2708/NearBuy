import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type?: 'store' | 'user' | 'driver';
  subtitle?: string;
  onClick?: () => void;
}

interface LeafletMapProps {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  routePath?: [number, number][];
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center,
  zoom = 14,
  markers = [],
  routePath,
  className = 'h-96 w-full rounded-2xl',
  onMapClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);

      if (onMapClick) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(center, zoom);
    }

    return () => {
      // Keep map alive or cleanup if unmounted
    };
  }, []);

  // Center update
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Markers update
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    markers.forEach((m) => {
      let iconHtml = '';
      if (m.type === 'user') {
        iconHtml = `
          <div style="background-color: #7C3AED; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4); border: 2.5px solid white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
        `;
      } else if (m.type === 'driver') {
        iconHtml = `
          <div style="background-color: #16A34A; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4); border: 2.5px solid white; animation: pulse 1.8s infinite;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"></circle><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="15" cy="5" r="1"></circle><path d="M12 17.5V14l-3-3 4-3 2 3h2"></path></svg>
          </div>
        `;
      } else {
        // Store
        iconHtml = `
          <div style="background-color: #F97316; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4); border: 2.5px solid white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path><path d="M2 7h20"></path></svg>
          </div>
        `;
      }

      const customIcon = L.divIcon({
        className: 'custom-pin-marker',
        html: iconHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([m.lat, m.lng], { icon: customIcon });

      if (m.title) {
        marker.bindPopup(`
          <div style="font-family: inherit; padding: 4px;">
            <div style="font-weight: 700; font-size: 14px; color: #171717;">${m.title}</div>
            ${m.subtitle ? `<div style="font-size: 12px; color: #737373; margin-top: 2px;">${m.subtitle}</div>` : ''}
          </div>
        `);
      }

      if (m.onClick) {
        marker.on('click', () => m.onClick?.());
      }

      marker.addTo(markersGroupRef.current!);
    });
  }, [markers]);

  // Route path update
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (routePath && routePath.length > 1) {
      const polyline = L.polyline(routePath, {
        color: '#F97316',
        weight: 4,
        opacity: 0.85,
        dashArray: '6, 8',
      }).addTo(mapInstanceRef.current);

      routeLayerRef.current = polyline;
    }
  }, [routePath]);

  return (
    <div className="relative overflow-hidden shadow-inner border border-stone-200 dark:border-stone-800">
      <div ref={mapContainerRef} className={className} />
      <div className="absolute bottom-2 right-2 z-20 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] text-stone-600 dark:text-stone-400 font-medium border border-stone-200 dark:border-stone-800 shadow-xs pointer-events-none">
        OpenStreetMap · Hyperlocal GPS
      </div>
    </div>
  );
};
