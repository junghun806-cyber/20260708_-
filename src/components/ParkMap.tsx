"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import type { TrashBinWithCoords } from "@/types/park";
import { getTrashTypeBadges } from "@/lib/trashType";

const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

function groupByCoords(bins: TrashBinWithCoords[]) {
  const groups = new Map<string, TrashBinWithCoords[]>();
  for (const bin of bins) {
    if (!bin.coords) continue;
    const key = `${bin.coords.lat},${bin.coords.lng}`;
    const group = groups.get(key);
    if (group) group.push(bin);
    else groups.set(key, [bin]);
  }
  return groups;
}

function infoWindowContent(group: TrashBinWithCoords[]) {
  const rows = group
    .map((bin) => {
      const badges = getTrashTypeBadges(bin.쓰레기통종류)
        .map((b) => `${b.icon} ${b.label}`)
        .join(", ");
      return `<div style="margin-top:4px;">${badges}</div>`;
    })
    .join("");

  return `
    <div style="padding:10px 12px;max-width:220px;font-size:12px;line-height:1.4;color:#27272a;">
      <strong style="font-size:13px;">${group[0].세부위치}</strong>
      ${rows}
    </div>
  `;
}

export default function ParkMap({ bins }: { bins: TrashBinWithCoords[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);

  const located = bins.filter((bin) => bin.coords !== null);

  useEffect(() => {
    if (!sdkReady || !mapRef.current || located.length === 0) return;

    window.kakao.maps.load(() => {
      const { kakao } = window;
      if (!mapRef.current) return;

      const groups = groupByCoords(located);
      const first = located[0].coords!;
      const map = new kakao.maps.Map(mapRef.current, {
        center: new kakao.maps.LatLng(first.lat, first.lng),
        level: 4,
      });

      const bounds = new kakao.maps.LatLngBounds();
      let markerCount = 0;

      for (const group of groups.values()) {
        const { lat, lng } = group[0].coords!;
        const position = new kakao.maps.LatLng(lat, lng);
        bounds.extend(position);
        markerCount++;

        const marker = new kakao.maps.Marker({ position, map });
        const infowindow = new kakao.maps.InfoWindow({
          content: infoWindowContent(group),
        });
        kakao.maps.event.addListener(marker, "click", () => {
          infowindow.open(map, marker);
        });
      }

      if (markerCount > 1) map.setBounds(bounds);
    });
  }, [sdkReady, located]);

  if (located.length === 0) return null;

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
