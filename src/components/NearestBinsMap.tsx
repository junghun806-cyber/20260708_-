"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import type { Coordinates, TrashBinLocation } from "@/types/trashBin";
import type { KakaoInfoWindow, KakaoMap, KakaoMarker } from "@/types/kakao";
import { getTrashTypeBadges } from "@/lib/trashType";

const FOCUS_ZOOM_LEVEL = 3;

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

function locationKey(coords: Coordinates): string {
  return `${coords.lat},${coords.lng}`;
}

export default function NearestBinsMap({
  locations,
  userLocation,
  focusedKey,
}: {
  locations: TrashBinLocation[];
  userLocation?: Coordinates;
  focusedKey?: string | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const mapInstanceRef = useRef<KakaoMap | null>(null);
  const markerEntriesRef = useRef(
    new Map<string, { marker: KakaoMarker; infowindow: KakaoInfoWindow; isOpen: boolean }>(),
  );

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
      mapInstanceRef.current = map;
      markerEntriesRef.current.clear();

      const bounds = new kakao.maps.LatLngBounds();

      for (const location of locations) {
        const { lat, lng } = location.coords;
        const position = new kakao.maps.LatLng(lat, lng);
        bounds.extend(position);

        const marker = new kakao.maps.Marker({ position, map });
        const infowindow = new kakao.maps.InfoWindow({
          content: infoWindowContent(location),
        });
        const entry = { marker, infowindow, isOpen: false };
        markerEntriesRef.current.set(locationKey(location.coords), entry);
        kakao.maps.event.addListener(marker, "click", () => {
          if (entry.isOpen) {
            infowindow.close();
          } else {
            infowindow.open(map, marker);
          }
          entry.isOpen = !entry.isOpen;
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
        let isOpen = false;
        kakao.maps.event.addListener(marker, "click", () => {
          if (isOpen) {
            infowindow.close();
          } else {
            infowindow.open(map, marker);
          }
          isOpen = !isOpen;
        });
      }

      if (locations.length > 1 || userLocation) map.setBounds(bounds);
    });
  }, [sdkReady, locations, userLocation]);

  useEffect(() => {
    if (!focusedKey) return;
    const map = mapInstanceRef.current;
    const entry = markerEntriesRef.current.get(focusedKey);
    if (!map || !entry) return;

    const { kakao } = window;
    const location = locations.find((l) => locationKey(l.coords) === focusedKey);
    if (!location) return;

    map.panTo(new kakao.maps.LatLng(location.coords.lat, location.coords.lng));
    map.setLevel(FOCUS_ZOOM_LEVEL);
    if (!entry.isOpen) {
      entry.infowindow.open(map, entry.marker);
      entry.isOpen = true;
    }
  }, [focusedKey, locations]);

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
        className="h-64 w-full rounded-[14px] border border-[#dddddd] bg-[#f7f7f7] md:h-full dark:border-zinc-800 dark:bg-zinc-900"
      />
    </>
  );
}
