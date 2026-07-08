"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import type { Coordinates, TrashBinLocation } from "@/types/trashBin";
import { getTrashTypeBadges } from "@/lib/trashType";

const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

// Blue "you are here" dot (halo + solid center) so it reads differently
// from the default red bin-marker pins.
const CURRENT_LOCATION_MARKER_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
    <circle cx="14" cy="14" r="13" fill="#2563eb" fill-opacity="0.25" />
    <circle cx="14" cy="14" r="7" fill="#2563eb" stroke="white" stroke-width="3" />
  </svg>
`;

function infoWindowContent(location: TrashBinLocation) {
  const rows = location.쓰레기통종류목록
    .map((type) => {
      const badges = getTrashTypeBadges(type)
        .map((b) => `${b.icon} ${b.label}`)
        .join(", ");
      return `<div style="margin-top:4px;">${badges}</div>`;
    })
    .join("");

  return `
    <div style="padding:10px 12px;max-width:220px;font-size:12px;line-height:1.4;color:#27272a;">
      <strong style="font-size:13px;">${location.세부위치}</strong>
      ${rows}
    </div>
  `;
}

export default function NearestBinsMap({
  locations,
  userLocation,
}: {
  locations: TrashBinLocation[];
  userLocation?: Coordinates;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    if (!sdkReady || !mapRef.current || locations.length === 0) return;

    window.kakao.maps.load(() => {
      const { kakao } = window;
      if (!mapRef.current) return;

      const first = userLocation ?? locations[0].coords;
      const map = new kakao.maps.Map(mapRef.current, {
        center: new kakao.maps.LatLng(first.lat, first.lng),
        level: 4,
      });

      const bounds = new kakao.maps.LatLngBounds();

      for (const location of locations) {
        const { lat, lng } = location.coords;
        const position = new kakao.maps.LatLng(lat, lng);
        bounds.extend(position);

        const marker = new kakao.maps.Marker({ position, map });
        const infowindow = new kakao.maps.InfoWindow({
          content: infoWindowContent(location),
        });
        kakao.maps.event.addListener(marker, "click", () => {
          infowindow.open(map, marker);
        });
      }

      if (userLocation) {
        const position = new kakao.maps.LatLng(userLocation.lat, userLocation.lng);
        bounds.extend(position);

        const markerImage = new kakao.maps.MarkerImage(
          `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(CURRENT_LOCATION_MARKER_SVG)}`,
          new kakao.maps.Size(28, 28),
          { offset: new kakao.maps.Point(14, 14) },
        );
        const marker = new kakao.maps.Marker({
          position,
          map,
          image: markerImage,
          zIndex: 10,
        });
        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:6px 10px;font-size:12px;color:#27272a;">📍 현재 위치</div>`,
        });
        kakao.maps.event.addListener(marker, "click", () => {
          infowindow.open(map, marker);
        });
      }

      if (locations.length > 1 || userLocation) map.setBounds(bounds);
    });
  }, [sdkReady, locations, userLocation]);

  if (locations.length === 0) return null;

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false`}
        strategy="afterInteractive"
        onReady={() => setSdkReady(true)}
      />
      <div
        ref={mapRef}
        className="h-64 w-full rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
      />
    </>
  );
}
