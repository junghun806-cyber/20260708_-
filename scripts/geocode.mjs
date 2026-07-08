// One-time script: resolve 도로명주소 strings in the trash bin dataset to
// lat/lng using the Kakao Local API, and cache the result to
// data/geocoded.json so the app never geocodes at request time.
//
// Run with: node --env-file=.env.local scripts/geocode.mjs
import fs from "node:fs/promises";
import path from "node:path";

const REST_API_KEY = process.env.KAKAO_REST_API_KEY;
if (!REST_API_KEY) {
  console.error("KAKAO_REST_API_KEY is not set (did you pass --env-file=.env.local?)");
  process.exit(1);
}

const DATA_PATH = path.resolve(import.meta.dirname, "../data/가로쓰레기통.json");
const OUT_PATH = path.resolve(import.meta.dirname, "../data/geocoded.json");

async function callKakao(url) {
  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${REST_API_KEY}` },
  });
  if (!res.ok) throw new Error(`Kakao API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function searchAddress(query) {
  const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`;
  const json = await callKakao(url);
  const doc = json.documents?.[0];
  if (!doc) return null;
  return { lat: Number(doc.y), lng: Number(doc.x) };
}

async function searchKeyword(query) {
  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`;
  const json = await callKakao(url);
  const doc = json.documents?.[0];
  if (!doc) return null;
  return { lat: Number(doc.y), lng: Number(doc.x) };
}

// Kakao's address search is picky about parenthetical suffixes like
// "장지동 896-1(위례중앙로)" — strip them and retry before falling back
// to a keyword (place-name) search.
function stripParenthetical(address) {
  return address.replace(/\([^)]*\)/g, "").trim();
}

async function geocode(address, detail) {
  for (const candidate of [address, stripParenthetical(address)]) {
    if (!candidate) continue;
    const hit = await searchAddress(candidate);
    if (hit) return { ...hit, method: "address", query: candidate };
  }
  for (const candidate of [detail, address]) {
    if (!candidate) continue;
    const hit = await searchKeyword(candidate);
    if (hit) return { ...hit, method: "keyword", query: candidate };
  }
  return null;
}

const raw = JSON.parse(await fs.readFile(DATA_PATH, "utf-8"));

// Dedup by 도로명주소 (many bins at the same spot share the same address).
const uniqueAddresses = new Map();
for (const bin of raw) {
  if (!uniqueAddresses.has(bin.도로명주소)) {
    uniqueAddresses.set(bin.도로명주소, bin.세부위치);
  }
}

console.log(`Geocoding ${uniqueAddresses.size} unique addresses...`);

const result = {};
let ok = 0;
let failed = 0;
for (const [address, detail] of uniqueAddresses) {
  try {
    const hit = await geocode(address, detail);
    if (hit) {
      result[address] = { lat: hit.lat, lng: hit.lng };
      ok++;
    } else {
      result[address] = null;
      failed++;
      console.warn("NO MATCH:", address, "|", detail);
    }
  } catch (err) {
    result[address] = null;
    failed++;
    console.error("ERROR:", address, err.message);
  }
  // Be polite to the API.
  await new Promise((r) => setTimeout(r, 60));
}

await fs.writeFile(OUT_PATH, JSON.stringify(result, null, 2) + "\n", "utf-8");
console.log(`Done. ok=${ok} failed=${failed} -> ${OUT_PATH}`);
