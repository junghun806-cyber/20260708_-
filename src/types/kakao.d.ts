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
    }) => KakaoMarker;
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
