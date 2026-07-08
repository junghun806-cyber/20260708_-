import rawData from "../../data/공원광장_쓰레기통.json";
import geocoded from "../../data/geocoded.json";
import type {
  Coordinates,
  ParkData,
  ParkDataWithCoords,
  TrashBinWithCoords,
} from "@/types/park";
import { haversineDistanceMeters } from "@/lib/geo";

const geocodedByAddress = geocoded as Record<string, Coordinates | null>;

function attachCoords(park: ParkData): ParkDataWithCoords {
  return {
    ...park,
    쓰레기통목록: park.쓰레기통목록.map(
      (bin): TrashBinWithCoords => ({
        ...bin,
        coords: geocodedByAddress[bin.도로명주소] ?? null,
      }),
    ),
  };
}

const parks = (rawData as ParkData[]).map(attachCoords);

export function getAllParks(): ParkDataWithCoords[] {
  return parks;
}

export function getParkNames(): string[] {
  return parks.map((park) => park.공원광장명);
}

export function findParkByName(name: string): ParkDataWithCoords | undefined {
  return parks.find((park) => park.공원광장명 === name);
}

export function parkNeedsReview(park: ParkDataWithCoords): boolean {
  return park.쓰레기통목록.some((bin) => bin.품질 === "검토");
}

export interface NearestBinResult {
  park: ParkDataWithCoords;
  bin: TrashBinWithCoords;
  distanceMeters: number;
}

export function findNearestBin(point: Coordinates): NearestBinResult | null {
  let best: NearestBinResult | null = null;

  for (const park of parks) {
    for (const bin of park.쓰레기통목록) {
      if (!bin.coords) continue;
      const distanceMeters = haversineDistanceMeters(point, bin.coords);
      if (!best || distanceMeters < best.distanceMeters) {
        best = { park, bin, distanceMeters };
      }
    }
  }

  return best;
}
