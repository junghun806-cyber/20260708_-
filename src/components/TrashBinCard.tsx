"use client";

import { useState } from "react";
import type { TrashBinLocation } from "@/types/trashBin";
import { getTrashTypeBadges } from "@/lib/trashType";
import { buildKakaoDirectionsUrl, formatDistance, getCurrentPosition } from "@/lib/geo";
import { logDirectionsClick } from "@/lib/analytics";

export default function TrashBinCard({
  location,
  distanceMeters,
  rank,
}: {
  location: TrashBinLocation;
  distanceMeters: number;
  rank: number;
}) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const badges = location.쓰레기통종류목록.flatMap((type) => getTrashTypeBadges(type));

  async function handleDirectionsClick() {
    const coords = location.coords;
    setError(null);
    setLocating(true);
    let hadGeolocation = false;
    try {
      const position = await getCurrentPosition();
      hadGeolocation = true;
      const url = buildKakaoDirectionsUrl(
        { name: location.세부위치, lat: coords.lat, lng: coords.lng },
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
        name: location.세부위치,
        lat: coords.lat,
        lng: coords.lng,
      });
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setLocating(false);
      logDirectionsClick({
        installType: location.설치장소유형,
        detailLocation: location.세부위치,
        trashType: location.쓰레기통종류목록.join("+"),
        gu: location.자치구,
        hadGeolocation,
      });
    }
  }

  return (
    <li
      className={`rounded-xl border bg-white p-4 shadow-sm dark:bg-zinc-900 ${
        rank === 0
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
        <span className="ml-auto inline-flex shrink-0 items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          {rank === 0 ? "📍 가장 가까움" : `약 ${formatDistance(distanceMeters)}`}
        </span>
      </div>
      <p className="font-medium text-zinc-900 dark:text-zinc-100">
        {location.세부위치}
      </p>
      <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
        {location.도로명주소}
      </p>
      <div className="mt-1 flex items-center justify-between">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          {location.자치구} · {location.설치장소유형}
        </p>
        <button
          type="button"
          onClick={handleDirectionsClick}
          disabled={locating}
          className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
        >
          {locating ? "위치 확인 중..." : "길찾기"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </li>
  );
}
