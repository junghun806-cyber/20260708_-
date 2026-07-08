"use client";

import { useState } from "react";
import { findNearestBinLocations, type NearestBinLocationResult } from "@/lib/bins";

export default function NearestBinsHome({
  onFound,
}: {
  onFound: (results: NearestBinLocationResult[]) => void;
}) {
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
        const results = findNearestBinLocations(point, 10);
        if (results.length === 0) {
          setGeoError("가까운 쓰레기통 정보를 찾을 수 없습니다.");
          return;
        }
        onFound(results);
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

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:py-16">
      <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        서울시 전역 쓰레기통 찾기
      </h1>
      <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
        긴급 버튼을 누르면 서울시 전역에서 현재 위치와 가장 가까운 쓰레기통
        10곳을 찾아드려요.
      </p>

      <button
        type="button"
        onClick={handleEmergencyClick}
        disabled={locating}
        className="flex items-center gap-2 rounded-full bg-red-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {locating ? "위치 확인 중..." : <>🚨 긴급</>}
      </button>

      {geoError && (
        <p className="mt-4 max-w-[280px] rounded-lg border border-red-200 bg-white p-3 text-xs text-red-600 shadow-md dark:border-red-900/50 dark:bg-zinc-900 dark:text-red-400">
          {geoError}
        </p>
      )}
    </div>
  );
}
