import rawData from "../../data/가로쓰레기통.json";
import geocoded from "../../data/geocoded.json";
import type { Coordinates, TrashBin, TrashBinLocation } from "@/types/trashBin";
import { haversineDistanceMeters } from "@/lib/geo";

const geocodedByAddress = geocoded as Record<string, Coordinates | null>;

function groupIntoLocations(bins: TrashBin[]): TrashBinLocation[] {
  const byCoordKey = new Map<string, TrashBinLocation>();

  for (const bin of bins) {
    const coords = geocodedByAddress[bin.도로명주소];
    if (!coords) continue;

    const key = `${coords.lat},${coords.lng}`;
    const existing = byCoordKey.get(key);
    if (existing) {
      if (!existing.쓰레기통종류목록.includes(bin.쓰레기통종류)) {
        existing.쓰레기통종류목록.push(bin.쓰레기통종류);
      }
      continue;
    }

    byCoordKey.set(key, {
      자치구: bin.자치구,
      도로명주소: bin.도로명주소,
      세부위치: bin.세부위치,
      설치장소유형: bin.설치장소유형,
      coords,
      쓰레기통종류목록: [bin.쓰레기통종류],
    });
  }

  return [...byCoordKey.values()];
}

const locations = groupIntoLocations(rawData as TrashBin[]);

export interface NearestBinLocationResult {
  location: TrashBinLocation;
  distanceMeters: number;
}

export function findNearestBinLocations(
  point: Coordinates,
  limit = 10,
): NearestBinLocationResult[] {
  return locations
    .map((location) => ({
      location,
      distanceMeters: haversineDistanceMeters(point, location.coords),
    }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, limit);
}
