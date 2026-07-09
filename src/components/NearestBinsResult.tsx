"use client";

import { useRef, useState } from "react";
import { Inter } from "next/font/google";
import type { Coordinates } from "@/types/trashBin";
import type { NearestBinLocationResult } from "@/lib/bins";
import TrashBinCard from "@/components/TrashBinCard";
import NearestBinsMap from "@/components/NearestBinsMap";

// Airbnb's own type substitute recommendation (Cereal VF is proprietary) —
// scoped to this screen only via a locally-generated font class, so step 1
// and step 3 keep the app's existing Geist type.
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

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
    // No-op once md:overflow-hidden keeps the map permanently in view; still
    // useful below md, where the page scrolls normally and the map can be
    // scrolled out of sight above a long list.
    mapWrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <div
      className={`${inter.className} mx-auto flex w-full max-w-6xl flex-col px-4 py-6 sm:px-6 md:h-screen md:overflow-hidden md:px-8`}
    >
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-sm text-[#222222] hover:underline dark:text-zinc-100"
      >
        ← 다시 찾기
      </button>

      <h1 className="mb-1 text-[21px] font-bold leading-tight text-[#222222] dark:text-zinc-50">
        현재 위치에서 가까운 쓰레기통 {results.length}곳
      </h1>
      <p className="mb-6 text-sm text-[#6a6a6a] dark:text-zinc-400">
        가까운 순서대로 정렬했어요. 목록을 누르면 지도가 해당 위치로 확대돼요.
      </p>

      {/* Below md, this is a plain stacked flow (map, then list) — the page
          itself scrolls. From md up, it becomes a fixed-height Airbnb-style
          split: the list scrolls independently on the left, and the map
          stays put filling the right column. min-h-0 is required for a flex
          child to actually shrink to the parent's remaining height instead
          of pushing it taller than the screen. */}
      <div className="flex flex-col gap-6 md:min-h-0 md:flex-1 md:grid md:grid-cols-[7fr_8fr] md:gap-8">
        <ul className="order-2 flex flex-col gap-3 md:order-1 md:h-full md:overflow-y-auto md:pr-1">
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

        <div ref={mapWrapperRef} className="order-1 md:order-2 md:h-full">
          <NearestBinsMap
            locations={results.map((r) => r.location)}
            userLocation={userLocation}
            focusedKey={focusedKey}
          />
        </div>
      </div>
    </div>
  );
}
