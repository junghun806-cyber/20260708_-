export type QualityLevel = "상" | "검토";

export interface TrashBin {
  자치구: string;
  도로명주소: string;
  세부위치: string;
  쓰레기통종류: string;
  품질: QualityLevel;
}

export interface ParkData {
  공원광장명: string;
  쓰레기통목록: TrashBin[];
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TrashBinWithCoords extends TrashBin {
  coords: Coordinates | null;
}

export interface ParkDataWithCoords extends Omit<ParkData, "쓰레기통목록"> {
  쓰레기통목록: TrashBinWithCoords[];
}
