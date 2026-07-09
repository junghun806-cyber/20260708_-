"use client";

import { useEffect, useState } from "react";
import type { Coordinates } from "@/types/trashBin";
import { findNearestBinLocations, type NearestBinLocationResult } from "@/lib/bins";
import { isMobileUserAgent, openInExternalBrowser } from "@/lib/inAppBrowser";

// Belt-and-suspenders on top of the native `timeout` option: some in-app
// WebViews (notably KakaoTalk's) never invoke either geolocation callback at
// all when location permission is blocked, so the native timeout never
// fires either. This guarantees "위치 확인 중" always resolves.
const GEOLOCATION_FALLBACK_TIMEOUT_MS = 12000;

export default function NearestBinsHome({
  onFound,
}: {
  onFound: (results: NearestBinLocationResult[], userLocation: Coordinates) => void;
}) {
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileUserAgent(navigator.userAgent));
  }, []);

  // Most in-app WebViews (Everytime, KakaoTalk, ...) don't identify
  // themselves in the User-Agent, so we can't reliably tell "definitely an
  // in-app browser" apart from "real mobile Safari/Chrome that genuinely
  // failed to get a location fix". Treat any mobile failure as possibly an
  // in-app browser and offer the escape hatch either way — it's a no-op
  // button for someone already in a real browser.
  const mobileGeoErrorHint =
    "위치 확인에 실패했습니다. 앱 내 브라우저(카카오톡, 에브리타임 등)에서 열었다면 아래 버튼으로 외부 브라우저에서 열어주세요.";

  function handleEmergencyClick() {
    setGeoError(null);

    if (!("geolocation" in navigator)) {
      setGeoError("이 브라우저는 위치 정보를 지원하지 않습니다.");
      return;
    }

    setLocating(true);
    let settled = false;

    const fallbackTimer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      setLocating(false);
      setGeoError(isMobile ? mobileGeoErrorHint : "현재 위치를 가져오지 못했습니다. 다시 시도해주세요.");
    }, GEOLOCATION_FALLBACK_TIMEOUT_MS);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(fallbackTimer);
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
        onFound(results, point);
      },
      (error) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(fallbackTimer);
        setLocating(false);
        if (isMobile) {
          setGeoError(mobileGeoErrorHint);
        } else if (error.code === error.PERMISSION_DENIED) {
          setGeoError("위치 권한이 거부되었습니다. 브라우저 설정에서 위치 접근을 허용해주세요.");
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
        <div className="mt-4 max-w-[280px] rounded-lg border border-red-200 bg-white p-3 shadow-md dark:border-red-900/50 dark:bg-zinc-900">
          <p className="text-xs text-red-600 dark:text-red-400">{geoError}</p>
          {isMobile && (
            <button
              type="button"
              onClick={async () => {
                const result = await openInExternalBrowser(window.location.href);
                if (result === "copied") {
                  setGeoError(
                    "링크를 복사했어요. Safari 또는 Chrome 앱을 열어 주소창에 붙여넣어 주세요.",
                  );
                } else if (result === "failed") {
                  window.prompt(
                    "아래 주소를 복사해서 Safari 또는 Chrome에 붙여넣어 주세요.",
                    window.location.href,
                  );
                }
              }}
              className="mt-2 w-full rounded-md bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              외부 브라우저에서 열기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
