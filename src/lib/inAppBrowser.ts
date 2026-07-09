// Many apps (KakaoTalk, Naver, Line, Instagram, Facebook, campus community
// apps like Everytime, ...) open shared links in an embedded WebView rather
// than the system browser. These WebViews frequently can't get location
// permission at all — navigator.geolocation just times out — with no
// reliable way to detect *which* app it is, since most don't advertise
// themselves in the User-Agent the way KakaoTalk does. So we can't build a
// complete allowlist; instead we treat any geolocation failure on a mobile
// device as a likely in-app-browser problem and offer a way out.
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

export function isMobileUserAgent(userAgent: string): boolean {
  return /android|iphone|ipad|ipod/i.test(userAgent);
}

// Only KakaoTalk exposes a documented scheme for jumping straight to the
// device's default browser. For every other app (including ones we can't
// identify, like Everytime's in-app browser) the reliable fallback is to
// copy the link so the user can paste it into Safari/Chrome themselves —
// confirmed to work regardless of which app the link was opened from.
export async function openInExternalBrowser(
  url: string,
): Promise<"opened" | "copied" | "failed"> {
  if (typeof navigator === "undefined") return "failed";
  if (detectInAppBrowser(navigator.userAgent) === "kakaotalk") {
    window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
    return "opened";
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}
