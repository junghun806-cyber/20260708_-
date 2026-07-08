"use client";

import { useMemo, useState } from "react";
import type { ParkDataWithCoords } from "@/types/park";
import { parkNeedsReview, findNearestBin, type NearestBinResult } from "@/lib/parks";
import { normalizeForSearch } from "@/lib/search";

export default function ParkSearch({
  parks,
  onSelect,
  onEmergency,
}: {
  parks: ParkDataWithCoords[];
  onSelect: (park: ParkDataWithCoords) => void;
  onEmergency: (result: NearestBinResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [notFound, setNotFound] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  function handleEmergencyClick() {
    setGeoError(null);

    if (!("geolocation" in navigator)) {
      setGeoError("이 브라우저는 위치 정보를 지원하지 않습니다.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const point = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const nearest = findNearestBin(point);
        if (!nearest) {
          setGeoError("가까운 쓰레기통 정보를 찾을 수 없습니다.");
          return;
        }
        onEmergency(nearest);
      },
      (error) => {
        setLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError(
            "위치 권한이 거부되었습니다. 브라우저 설정에서 위치 접근을 허용해주세요.",
          );
        } else {
          setGeoError("현재 위치를 가져오지 못했습니다. 다시 시도해주세요.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const filtered = useMemo(() => {
    const q = normalizeForSearch(query.trim());
    if (!q) return parks;
    return parks.filter((park) =>
      normalizeForSearch(park.공원광장명).includes(q),
    );
  }, [parks, query]);

  function selectPark(park: ParkDataWithCoords) {
    setNotFound(false);
    setIsOpen(false);
    setQuery("");
    onSelect(park);
  }

  function handleChange(value: string) {
    setQuery(value);
    setActiveIndex(0);
    setNotFound(false);
    setIsOpen(true);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length > 0) {
        selectPark(filtered[activeIndex] ?? filtered[0]);
      } else {
        setNotFound(true);
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:py-16">
      <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        서울시 공원·광장 쓰레기통 찾기
      </h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        공원이나 광장 이름을 검색해서 주변 쓰레기통 위치를 확인해보세요.
      </p>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 100)}
          placeholder="공원/광장 이름 검색 (예: 오목공원)"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="park-search-listbox"
        />

        {isOpen && (
          <ul
            id="park-search-listbox"
            role="listbox"
            className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
          >
            {filtered.length > 0 ? (
              filtered.map((park, i) => {
                const needsReview = parkNeedsReview(park);
                return (
                  <li key={park.공원광장명}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectPark(park)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                        i === activeIndex
                          ? "bg-zinc-100 dark:bg-zinc-800"
                          : ""
                      }`}
                    >
                      <span className="text-zinc-900 dark:text-zinc-100">
                        {park.공원광장명}
                      </span>
                      {needsReview && (
                        <span
                          title="정식 명칭 확인 필요"
                          className="ml-auto inline-flex shrink-0 items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                        >
                          확인 필요
                        </span>
                      )}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                일치하는 공원/광장이 없습니다
              </li>
            )}
          </ul>
        )}
      </div>

      {notFound && (
        <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
          데이터가 없는 지역입니다.
        </p>
      )}

      <button
        type="button"
        onClick={handleEmergencyClick}
        disabled={locating}
        className="fixed bottom-6 right-6 z-20 flex items-center gap-1.5 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {locating ? "위치 확인 중..." : <>🚨 긴급</>}
      </button>

      {geoError && (
        <p className="fixed bottom-24 right-6 z-20 max-w-[240px] rounded-lg border border-red-200 bg-white p-3 text-xs text-red-600 shadow-md dark:border-red-900/50 dark:bg-zinc-900 dark:text-red-400">
          {geoError}
        </p>
      )}
    </div>
  );
}
