'use client';
import dynamic from 'next/dynamic';

let _setMapRef: ((map: any) => void) | null = null;

export function setMapRefCallback(cb: ((map: any) => void) | null) {
  _setMapRef = cb;
}
const MapRefSetter = dynamic(
  () => Promise.resolve(function MapRefSetterInner() {
    const { useMap } = require('react-leaflet');
    const { useEffect: useEff } = require('react');
    const map = useMap();
    useEff(() => {
      // Sadece görünür (boyutu olan) haritayı kaydet
      // Mobil layout gizliyken (md:hidden) desktop mapRef'i override olmasın
      const container = map.getContainer();
      const w = container?.clientWidth || 0;
      const h = container?.clientHeight || 0;
      if (w > 0 && h > 0) {
        if (_setMapRef) _setMapRef(map);
      }
    }, [map]);
    return null;
  }),
  { ssr: false }
);

// Harita boyutunu doğru hesaplamak için invalidateSize tetikleyici
const MapResizer = dynamic(
  () => Promise.resolve(function MapResizerInner() {
    const { useMap } = require('react-leaflet');
    const { useEffect: useEff, useRef: useR } = require('react');
    const map = useMap();
    const containerRef = (useR as any)(null);
    useEff(() => {
      // Birden fazla zamanlayıcı ile invalidateSize
      const timers = [50, 150, 300, 600, 1000, 2000].map(ms =>
        setTimeout(() => map.invalidateSize(), ms)
      );
      // ResizeObserver ile container boyut değişikliklerini izle
      const container = map.getContainer();
      let ro: ResizeObserver | null = null;
      if (container && typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(() => {
          map.invalidateSize();
        });
        ro.observe(container);
        // Parent'ı da izle
        if (container.parentElement) {
          ro.observe(container.parentElement);
        }
      }
      return () => {
        timers.forEach(t => clearTimeout(t));
        ro?.disconnect();
      };
    }, [map]);
    return null;
  }),
  { ssr: false }
);

let _onMapBackClick: (() => void) | null = null;
export function setMapBackClickCallback(cb: (() => void) | null) {
  _onMapBackClick = cb;
}

const MapClickHandler = dynamic(
  () => Promise.resolve(function MapClickHandlerInner() {
    const { useMapEvents } = require('react-leaflet');
    useMapEvents({
      click: (e: any) => {
        if (e.originalEvent?._stopped) return;
        if (_onMapBackClick) _onMapBackClick();
      }
    });
    return null;
  }),
  { ssr: false }
);

export { MapRefSetter, MapResizer, MapClickHandler };
