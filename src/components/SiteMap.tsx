"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { averageCoordinates } from "@/lib/location";
import type { MapSpot } from "@/types/content";

type SiteMapProps = {
  spots: MapSpot[];
  zoom?: number;
};

export function SiteMap({ spots, zoom = 6 }: SiteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const center = averageCoordinates(spots);
    const map = new maplibregl.Map({
      container,
      style: {
        version: 8,
        sources: {
          gsi: {
            type: "raster",
            tiles: ["https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "地理院タイル",
          },
        },
        layers: [
          {
            id: "gsi",
            type: "raster",
            source: "gsi",
          },
        ],
      },
      center: [center.longitude, center.latitude],
      zoom,
    });

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(container);
    const animationFrame = requestAnimationFrame(() => map.resize());

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    spots.forEach((spot) => {
      if (!spot.coordinates) return;

      const popup = new maplibregl.Popup({ offset: 16 }).setHTML(
        `<strong>${spot.title}</strong><br />${spot.prefecture} ${spot.municipality}`,
      );

      new maplibregl.Marker({ color: "#1f5b49" })
        .setLngLat([spot.coordinates.longitude, spot.coordinates.latitude])
        .setPopup(popup)
        .addTo(map);
    });

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      map.remove();
    };
  }, [spots, zoom]);

  return (
    <div className="overflow-hidden rounded border border-zinc-200 bg-zinc-100">
      <div ref={containerRef} data-testid="site-map" className="h-[420px] w-full" />
      <p className="border-t border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600">
        背景地図: 地理院タイル。位置公開レベルにより、一部スポットは正確なピンを表示していません。
      </p>
    </div>
  );
}
