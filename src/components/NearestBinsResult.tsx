"use client";

import { useRef, useState } from "react";
import type { Coordinates } from "@/types/trashBin";
import type { NearestBinLocationResult } from "@/lib/bins";
import TrashBinCard from "@/components/TrashBinCard";
import NearestBinsMap from "@/components/NearestBinsMap";

export default function NearestBinsResult({
  results,
  userLocation,
  onBack,
}: {
  results: NearestBinLocationResult[];
  userLocation: Coordinates;
  onBack: () => void;
}) {
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);

  function handleSelect(coords: Coordinates) {
    setFocusedKey(`${coords.lat},${coords.lng}`);
    mapWrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← 다시 찾기
      </button>

      <h1 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        현재 위치에서 가까운 쓰레기통 {results.length}곳
      </h1>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        가까운 순서대로 정렬했어요. 목록을 누르면 지도가 해당 위치로 확대돼요.
      </p>

      <div className="mb-4" ref={mapWrapperRef}>
        <NearestBinsMap
          locations={results.map((r) => r.location)}
          userLocation={userLocation}
          focusedKey={focusedKey}
        />
      </div>

      <ul className="flex flex-col gap-3">
        {results.map((result, i) => (
          <TrashBinCard
            key={`${result.location.coords.lat},${result.location.coords.lng}`}
            location={result.location}
            distanceMeters={result.distanceMeters}
            rank={i}
            onSelect={() => handleSelect(result.location.coords)}
          />
        ))}
      </ul>
    </div>
  );
}
