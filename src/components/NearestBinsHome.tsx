"use client";

import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import type { Coordinates } from "@/types/trashBin";
import { findNearestBinLocations, type NearestBinLocationResult } from "@/lib/bins";
import { isMobileUserAgent, openInExternalBrowser } from "@/lib/inAppBrowser";
import TrashBinHeroIllustration from "@/components/TrashBinHeroIllustration";

// Same Airbnb-redesign font as the results screen — scoped here only, so
// step 3 (the external Kakao Maps handoff) is unaffected.
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700", "800", "900"] });

// Kept short on purpose: users bail ("is this broken?") well before a 10s
// wait, so we'd rather fail fast and hand them the external-browser escape
// hatch than hold out for a slow GPS fix.
const GEOLOCATION_TIMEOUT_MS = 5000;

// Belt-and-suspenders on top of the native `timeout` option: some in-app
// WebViews (notably KakaoTalk's) never invoke either geolocation callback at
// all when location permission is blocked, so the native timeout never
// fires either. This guarantees "위치 확인 중" always resolves — a small
// buffer past GEOLOCATION_TIMEOUT_MS so a well-behaved browser's own
// timeout error (with a real error code) wins the race.
const GEOLOCATION_FALLBACK_TIMEOUT_MS = GEOLOCATION_TIMEOUT_MS + 500;

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
      { enableHighAccuracy: true, timeout: GEOLOCATION_TIMEOUT_MS },
    );
  }

  return (
    <div
      className={`${inter.className} mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center overflow-hidden px-4 py-10 text-center sm:py-16`}
    >
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#ff385c]">
        서울시 전역 쓰레기통 찾기
      </p>

      <div className="mb-8 w-full max-w-xl">
        <h1 className="hero-headline select-none text-[16vw] font-black leading-[0.86] tracking-tight text-[#222222] sm:text-[6.5rem] dark:text-zinc-50">
          버리GO
          <br />
          <span className="inline-flex items-center justify-center gap-[0.12em]">
            가자
            <span
              className="hero-photo inline-block w-[0.85em] shrink-0 align-middle"
              style={{ aspectRatio: "5 / 6" }}
            >
              <TrashBinHeroIllustration />
            </span>
            GO
          </span>
        </h1>
      </div>

      <p className="mb-8 max-w-xs text-sm text-[#6a6a6a] dark:text-zinc-400">
        버튼 하나로 서울시 전역에서 현재 위치와 가장 가까운 쓰레기통 10곳을
        찾아드려요.
      </p>

      <button
        type="button"
        onClick={handleEmergencyClick}
        disabled={locating}
        className="flex items-center gap-2 rounded-full bg-[#ff385c] px-8 py-4 text-lg font-semibold text-white shadow-[0_2px_10px_rgba(255,56,92,0.35)] hover:bg-[#e00b41] disabled:cursor-not-allowed disabled:bg-[#ffd1da] disabled:shadow-none"
      >
        {locating ? "위치 확인 중..." : "지금 버리러 가기"}
      </button>

      {geoError && (
        <div className="mt-4 max-w-[280px] rounded-[14px] border border-[#dddddd] bg-white p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.02),0_2px_6px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.1)] dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-[#c13515] dark:text-red-400">{geoError}</p>
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
              className="mt-2 w-full rounded-full bg-[#222222] px-3 py-2 text-xs font-semibold text-white hover:bg-[#3f3f3f] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              외부 브라우저에서 열기
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .hero-headline {
          transform-origin: center;
          animation: hero-headline-grow 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes hero-headline-grow {
          from {
            transform: scale(0.55);
          }
          to {
            transform: scale(1);
          }
        }
        .hero-photo {
          opacity: 0;
          transform: scale(0.3);
          animation: hero-photo-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
        }
        @keyframes hero-photo-in {
          from {
            opacity: 0;
            transform: scale(0.3);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
      <style jsx global>{`
        .hero-lid {
          animation: hero-lid-open 0.5s ease-out 0.85s both;
        }
        @keyframes hero-lid-open {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-55deg);
          }
        }
        .hero-scrap {
          opacity: 0;
          animation: hero-scrap-fly 0.9s ease-out 0.95s both;
        }
        .hero-scrap-2 {
          animation-delay: 1.05s;
        }
        .hero-scrap-3 {
          animation-delay: 1.15s;
        }
        @keyframes hero-scrap-fly {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.6);
          }
          30% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-26px) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
