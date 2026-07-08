"use client";

import { useState } from "react";
import type { ParkDataWithCoords } from "@/types/park";
import { getAllParks, type NearestBinResult } from "@/lib/parks";
import ParkSearch from "@/components/ParkSearch";
import ParkResult, { type NearestHighlight } from "@/components/ParkResult";

const parks = getAllParks();

export default function Home() {
  const [selectedPark, setSelectedPark] = useState<ParkDataWithCoords | null>(
    null,
  );
  const [highlight, setHighlight] = useState<NearestHighlight | null>(null);

  function handleSelect(park: ParkDataWithCoords) {
    setHighlight(null);
    setSelectedPark(park);
  }

  function handleEmergency(result: NearestBinResult) {
    setHighlight({ bin: result.bin, distanceMeters: result.distanceMeters });
    setSelectedPark(result.park);
  }

  function handleBack() {
    setSelectedPark(null);
    setHighlight(null);
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      {selectedPark ? (
        <ParkResult park={selectedPark} onBack={handleBack} highlight={highlight} />
      ) : (
        <ParkSearch
          parks={parks}
          onSelect={handleSelect}
          onEmergency={handleEmergency}
        />
      )}
    </div>
  );
}
