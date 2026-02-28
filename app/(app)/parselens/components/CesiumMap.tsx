// @ts-nocheck
'use client';

import { useEffect, useRef, useState } from 'react';

interface CesiumMapProps {
  flyTo?: { lon: number; lat: number; polygon?: number[][] } | null;
  parcelData?: any;
}

export default function CesiumMap({ flyTo, parcelData }: CesiumMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cesium.com/downloads/cesiumjs/releases/1.122/Build/Cesium/Widgets/widgets.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cesium.com/downloads/cesiumjs/releases/1.122/Build/Cesium/Cesium.js';
    script.onload = () => {
      setLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!loaded || !containerRef.current || viewerRef.current) return;
    const Cesium = (window as any).Cesium;
    if (!Cesium) return;

    Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || '';

    const viewer = new Cesium.Viewer(containerRef.current, {
      terrain: Cesium.Terrain.fromWorldTerrain(),
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      selectionIndicator: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      infoBox: false,
      creditContainer: document.createElement('div'),
    });

    try {
      Cesium.createGooglePhotorealistic3DTileset().then((tileset: any) => {
        viewer.scene.primitives.add(tileset);
      }).catch(() => {});
    } catch {}

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(35.0, 39.0, 20000000),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0,
      },
      duration: 0,
    });

    viewer.scene.skyAtmosphere.show = true;
    viewerRef.current = viewer;
  }, [loaded]);

  const prevFlyToRef = useRef<string>('');
  const flyCounterRef = useRef(0);

  useEffect(() => {
    if (!flyTo || !viewerRef.current) return;
    flyCounterRef.current += 1;
    const thisFlightId = flyCounterRef.current;

    const Cesium = (window as any).Cesium;
    const viewer = viewerRef.current;

    try { viewer.camera.cancelFlight(); } catch {}
    viewer.entities.removeAll();

    if (flyTo.polygon && flyTo.polygon.length > 0) {
      const positions = flyTo.polygon.map((c: number[]) =>
        Cesium.Cartesian3.fromDegrees(c[0], c[1])
      );

      viewer.entities.add({
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(positions),
          material: Cesium.Color.fromCssColorString('#10b981').withAlpha(0.3),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          classificationType: Cesium.ClassificationType.BOTH,
        },
      });

      viewer.entities.add({
        polyline: {
          positions: [...positions, positions[0]],
          width: 5,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.3,
            color: Cesium.Color.fromCssColorString('#10b981'),
          }),
          clampToGround: true,
        },
      });

      const lons = flyTo.polygon.map((c: number[]) => c[0]);
      const lats = flyTo.polygon.map((c: number[]) => c[1]);
      const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const dLat = (Math.max(...lats) - Math.min(...lats)) * 111320;
      const dLon = (Math.max(...lons) - Math.min(...lons)) * 111320 * Math.cos(centerLat * Math.PI / 180);
      const extent = Math.max(dLat, dLon);
      const altitude = Math.max(extent * 1.8, 180);

      const tiltPitch = -55;
      const tiltAlt = altitude * 1.3;
      const southOffset = (tiltAlt / Math.tan(Math.abs(tiltPitch) * Math.PI / 180)) / 111320;

      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat - southOffset, tiltAlt),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(tiltPitch),
          roll: 0,
        },
        duration: 3.5,
      });
    } else {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(flyTo.lon, flyTo.lat, 400),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-70),
          roll: 0,
        },
        duration: 3.0,
      });
    }
  }, [flyTo]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/40 text-sm">3D Harita yükleniyor...</p>
          </div>
        </div>
      )}
    </div>
  );
}
