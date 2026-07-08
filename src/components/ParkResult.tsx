import type { TrashBinWithCoords, ParkDataWithCoords } from "@/types/park";
import { parkNeedsReview } from "@/lib/parks";
import { formatDistance } from "@/lib/geo";
import TrashBinCard from "@/components/TrashBinCard";
import ParkMap from "@/components/ParkMap";

export interface NearestHighlight {
  bin: TrashBinWithCoords;
  distanceMeters: number;
}

export default function ParkResult({
  park,
  onBack,
  highlight,
}: {
  park: ParkDataWithCoords;
  onBack: () => void;
  highlight?: NearestHighlight | null;
}) {
  const needsReview = parkNeedsReview(park);
  const bins = highlight
    ? [
        highlight.bin,
        ...park.쓰레기통목록.filter((bin) => bin !== highlight.bin),
      ]
    : park.쓰레기통목록;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← 다시 검색
      </button>

      <div className="mb-1 flex items-center gap-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {park.공원광장명}
        </h1>
        {needsReview && (
          <span
            title="정식 명칭 확인 필요"
            className="inline-flex shrink-0 items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
          >
            정식 명칭 확인 필요
          </span>
        )}
      </div>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        쓰레기통 {park.쓰레기통목록.length}개
      </p>

      {highlight && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300">
          📍 현재 위치에서 가장 가까운 쓰레기통을 찾았어요 (약{" "}
          {formatDistance(highlight.distanceMeters)})
        </div>
      )}

      {needsReview && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
          이 공원/광장은 아직 공식 명칭이 확인되지 않았어요. 실제 명칭과 다를
          수 있으니 참고해 주세요.
        </div>
      )}

      <div className="mb-4">
        <ParkMap bins={park.쓰레기통목록} />
      </div>

      <ul className="flex flex-col gap-3">
        {bins.map((bin, i) => (
          <TrashBinCard
            key={i}
            bin={bin}
            parkName={park.공원광장명}
            highlighted={bin === highlight?.bin}
          />
        ))}
      </ul>
    </div>
  );
}
