// One-time script: convert the raw Seoul-wide street trash bin xlsx
// (자치구명 / 설치위치 / 세부 위치 / 설치 장소 유형 / 수거 쓰레기 종류) into a
// flat JSON array the app can import, normalizing the trash-type strings so
// they match the "+"-delimited convention src/lib/trashType.ts expects.
//
// Run with: node scripts/convertBins.mjs
import fs from "node:fs/promises";
import path from "node:path";
import XLSX from "xlsx";

const SRC_PATH = path.resolve(
  import.meta.dirname,
  "../서울특별시 가로쓰레기통 설치정보_202511.xlsx",
);
const OUT_PATH = path.resolve(import.meta.dirname, "../data/가로쓰레기통.json");

const TRASH_TYPE_ALIASES = {
  일반쓰레기: "일반쓰레기",
  재활용쓰레기: "재활용쓰레기",
  "재활용 쓰레기": "재활용쓰레기",
  재활용: "재활용쓰레기",
  "담배꽁초 수거함": "담배꽁초",
  "일반, 재활용쓰레기": "일반쓰레기+재활용쓰레기",
  "담배꽁초/재활용쓰레기": "담배꽁초+재활용쓰레기",
};

function normalizeTrashType(raw) {
  if (!raw) return "기타";
  return TRASH_TYPE_ALIASES[raw] ?? raw;
}

const wb = XLSX.readFile(SRC_PATH);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { defval: null }).slice(3);

const bins = rows
  .map((row) => {
    const gu = row.__EMPTY_1;
    const roadAddress = row.__EMPTY_2;
    if (!gu || !roadAddress) return null;
    return {
      자치구: gu,
      도로명주소: roadAddress,
      세부위치: row.__EMPTY_3 ?? roadAddress,
      설치장소유형: row.__EMPTY_4 ?? "기타",
      쓰레기통종류: normalizeTrashType(row.__EMPTY_5),
    };
  })
  .filter((bin) => bin !== null);

await fs.writeFile(OUT_PATH, JSON.stringify(bins, null, 2) + "\n", "utf-8");
console.log(`Converted ${bins.length} bins -> ${OUT_PATH}`);
