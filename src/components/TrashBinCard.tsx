"use client";

import { useState, type MouseEvent } from "react";
import type { TrashBinLocation } from "@/types/trashBin";
import { getTrashTypeBadges } from "@/lib/trashType";
import { buildKakaoDirectionsUrl, formatDistance, getCurrentPosition } from "@/lib/geo";
import { logDirectionsClick } from "@/lib/analytics";

export default function TrashBinCard({
  location,
  distanceMeters,
  rank,
  onSelect,
}: {
  location: TrashBinLocation;
  distanceMeters: number;
  rank: number;
  onSelect?: () => void;
}) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const badges = location.쓰레기통종류목록.flatMap((type) => getTrashTypeBadges(type));

  async function handleDirectionsClick(e: MouseEvent) {
    e.stopPropagation();
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
      onClick={onSelect}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
      className={`rounded-[14px] border bg-white p-4 transition-shadow duration-150 dark:bg-zinc-900 ${
        onSelect ? "cursor-pointer hover:shadow-[0_0_0_1px_rgba(0,0,0,0.02),0_2px_6px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.1)]" : ""
      } ${
        rank === 0
          ? "border-[#ff385c] ring-2 ring-[#ffd1da] dark:border-[#ff385c] dark:ring-[#ff385c]/20"
          : "border-[#dddddd] dark:border-zinc-800"
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
        <span
          className={`ml-auto inline-flex shrink-0 items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold shadow-[0_2px_4px_rgba(0,0,0,0.18)] dark:bg-zinc-800 ${
            rank === 0 ? "text-[#ff385c]" : "text-[#222222] dark:text-zinc-100"
          }`}
        >
          {rank === 0 ? "📍 가장 가까움" : `약 ${formatDistance(distanceMeters)}`}
        </span>
      </div>
      <p className="font-semibold text-[#222222] dark:text-zinc-100">
        {location.세부위치}
      </p>
      <p className="mt-0.5 text-sm text-[#6a6a6a] dark:text-zinc-400">
        {location.도로명주소}
      </p>
      <div className="mt-1 flex items-center justify-between">
        <p className="text-xs text-[#929292] dark:text-zinc-500">
          {location.자치구} · {location.설치장소유형}
        </p>
        <button
          type="button"
          onClick={handleDirectionsClick}
          disabled={locating}
          className="inline-flex items-center gap-1 rounded-full bg-[#ff385c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e00b41] disabled:cursor-not-allowed disabled:bg-[#ffd1da]"
        >
          {locating ? "위치 확인 중..." : "길찾기"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-[#c13515] dark:text-red-400">{error}</p>
      )}
    </li>
  );
}
