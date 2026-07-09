// Several Korean chat apps' in-app browsers (most commonly KakaoTalk, since
// links are usually shared there) run in a restricted WebView that silently
// refuses to grant geolocation permission — navigator.geolocation never
// calls back, success or error, so "위치 확인 중" hangs forever. The fix is
// to detect these WebViews and push the user out to their real browser,
// where geolocation works normally.
export type InAppBrowser = "kakaotalk" | "naver" | "line" | "instagram" | "facebook" | null;

export function detectInAppBrowser(userAgent: string): InAppBrowser {
  const ua = userAgent.toLowerCase();
  if (ua.includes("kakaotalk")) return "kakaotalk";
  if (ua.includes("naver")) return "naver";
  if (ua.includes("line/")) return "line";
  if (ua.includes("instagram")) return "instagram";
  if (ua.includes("fban") || ua.includes("fbav")) return "facebook";
  return null;
}

// Only KakaoTalk exposes a documented scheme for jumping straight to the
// device's default browser; other apps require the user to tap the
// browser's own "..." menu (labelled "다른 브라우저로 열기" / "Safari로 열기").
export function openInExternalBrowser(url: string): boolean {
  if (typeof navigator === "undefined") return false;
  if (detectInAppBrowser(navigator.userAgent) === "kakaotalk") {
    window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
    return true;
  }
  return false;
}
