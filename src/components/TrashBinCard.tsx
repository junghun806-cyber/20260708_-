"use client";

import { useState } from "react";
import type { TrashBinWithCoords } from "@/types/park";
import { getTrashTypeBadges } from "@/lib/trashType";
import { buildKakaoDirectionsUrl, getCurrentPosition } from "@/lib/geo";
import { logDirectionsClick } from "@/lib/analytics";

export default function TrashBinCard({
  bin,
  parkName,
  highlighted,
}: {
  bin: TrashBinWithCoords;
  parkName: string;
  highlighted?: boolean;
}) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const badges = getTrashTypeBadges(bin.쓰레기통종류);

  async function handleDirectionsClick() {
    if (!bin.coords) return;
    const coords = bin.coords;
    setError(null);
    setLocating(true);
    let hadGeolocation = false;
    try {
      const position = await getCurrentPosition();
      hadGeolocation = true;
      const url = buildKakaoDirectionsUrl(
        { name: bin.세부위치, lat: coords.lat, lng: coords.lng },
        {
          name: "현재 위치",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
      );
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setError("현재 위치를 가져오지 못해 도착지만 표시돼요.");
      const url = buildKakaoDirectionsUrl({
        name: bin.세부위치,
        lat: coords.lat,
        lng: coords.lng,
      });
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setLocating(false);
      logDirectionsClick({
        parkName,
        detailLocation: bin.세부위치,
        trashType: bin.쓰레기통종류,
        gu: bin.자치구,
        hadGeolocation,
      });
    }
  }

  return (
    <li
      className={`rounded-xl border bg-white p-4 shadow-sm dark:bg-zinc-900 ${
        highlighted
          ? "border-blue-400 ring-2 ring-blue-200 dark:border-blue-500 dark:ring-blue-900/50"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {badges.map((badge, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${badge.classes}`}
          >
            <span aria-hidden>{badge.icon}</span>
            {badge.label}
          </span>
        ))}
        {highlighted && (
          <span className="ml-auto inline-flex shrink-0 items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            📍 가장 가까움
          </span>
        )}
      </div>
      <p className="font-medium text-zinc-900 dark:text-zinc-100">
        {bin.세부위치}
      </p>
      <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
        {bin.도로명주소}
      </p>
      <div className="mt-1 flex items-center justify-between">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          {bin.자치구}
        </p>
        {bin.coords && (
          <button
            type="button"
            onClick={handleDirectionsClick}
            disabled={locating}
            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
          >
            {locating ? "위치 확인 중..." : "길찾기"}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </li>
  );
}
