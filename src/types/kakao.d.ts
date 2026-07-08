export {};

declare global {
  interface Window {
    kakao: KakaoNamespace;
  }
}

interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

interface KakaoLatLngBounds {
  extend(latlng: KakaoLatLng): void;
}

interface KakaoMap {
  setBounds(bounds: KakaoLatLngBounds): void;
}

interface KakaoMarker {
  setMap(map: KakaoMap | null): void;
}

interface KakaoInfoWindow {
  open(map: KakaoMap, marker: KakaoMarker): void;
  close(): void;
}

interface KakaoSize {
  width: number;
  height: number;
}

interface KakaoPoint {
  x: number;
  y: number;
}

interface KakaoMarkerImage {
  // Opaque handle, only ever passed back into Marker options. The brand
  // keeps this from collapsing into an empty-interface "any" type.
  readonly __kakaoMarkerImageBrand: unique symbol;
}

interface KakaoNamespace {
  maps: {
    load(callback: () => void): void;
    LatLng: new (lat: number, lng: number) => KakaoLatLng;
    LatLngBounds: new () => KakaoLatLngBounds;
    Map: new (
      container: HTMLElement,
      options: { center: KakaoLatLng; level: number },
    ) => KakaoMap;
    Marker: new (options: {
      position: KakaoLatLng;
      map: KakaoMap;
      image?: KakaoMarkerImage;
      zIndex?: number;
    }) => KakaoMarker;
    MarkerImage: new (
      src: string,
      size: KakaoSize,
      options?: { offset?: KakaoPoint },
    ) => KakaoMarkerImage;
    Size: new (width: number, height: number) => KakaoSize;
    Point: new (x: number, y: number) => KakaoPoint;
    InfoWindow: new (options: { content: string }) => KakaoInfoWindow;
    event: {
      addListener(
        target: KakaoMarker,
        type: string,
        handler: () => void,
      ): void;
    };
  };
}
