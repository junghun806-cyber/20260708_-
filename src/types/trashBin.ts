export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TrashBin {
  자치구: string;
  도로명주소: string;
  세부위치: string;
  설치장소유형: string;
  쓰레기통종류: string;
}

// Several raw rows can share the same address/coordinates (one per trash
// type collected there) — a TrashBinLocation groups those into one spot.
export interface TrashBinLocation {
  자치구: string;
  도로명주소: string;
  세부위치: string;
  설치장소유형: string;
  coords: Coordinates;
  쓰레기통종류목록: string[];
}
