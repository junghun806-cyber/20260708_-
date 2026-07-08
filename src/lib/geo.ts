import type { Coordinates } from "@/types/park";

export function haversineDistanceMeters(a: Coordinates, b: Coordinates): number {
  const EARTH_RADIUS_M = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("GEOLOCATION_UNSUPPORTED"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });
}

interface DirectionsPoint {
  name: string;
  lat: number;
  lng: number;
}

export function buildKakaoDirectionsUrl(
  to: DirectionsPoint,
  from?: DirectionsPoint,
): string {
  const toPart = `${encodeURIComponent(to.name)},${to.lat},${to.lng}`;
  if (!from) return `https://map.kakao.com/link/to/${toPart}`;
  const fromPart = `${encodeURIComponent(from.name)},${from.lat},${from.lng}`;
  return `https://map.kakao.com/link/from/${fromPart}/to/${toPart}`;
}
