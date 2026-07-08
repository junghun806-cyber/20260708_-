"use client";

import { useState } from "react";
import type { Coordinates } from "@/types/trashBin";
import type { NearestBinLocationResult } from "@/lib/bins";
import NearestBinsHome from "@/components/NearestBinsHome";
import NearestBinsResult from "@/components/NearestBinsResult";

export default function Home() {
  const [found, setFound] = useState<{
    results: NearestBinLocationResult[];
    userLocation: Coordinates;
  } | null>(null);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      {found ? (
        <NearestBinsResult
          results={found.results}
          userLocation={found.userLocation}
          onBack={() => setFound(null)}
        />
      ) : (
        <NearestBinsHome
          onFound={(results, userLocation) => setFound({ results, userLocation })}
        />
      )}
    </div>
  );
}
