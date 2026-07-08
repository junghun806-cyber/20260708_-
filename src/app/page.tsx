"use client";

import { useState } from "react";
import type { NearestBinLocationResult } from "@/lib/bins";
import NearestBinsHome from "@/components/NearestBinsHome";
import NearestBinsResult from "@/components/NearestBinsResult";

export default function Home() {
  const [results, setResults] = useState<NearestBinLocationResult[] | null>(
    null,
  );

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      {results ? (
        <NearestBinsResult results={results} onBack={() => setResults(null)} />
      ) : (
        <NearestBinsHome onFound={setResults} />
      )}
    </div>
  );
}
