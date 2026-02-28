'use client';

import { useCallback, useRef } from 'react';
import { useMapStore } from '@/stores/useMapStore';

export function useSearchHandler() {
  const {
    searchQuery,
    setSearchQuery,
    setSearchResults,
    setSearchLoading,
    setShowSearchResults,
    setSearchPin,
  } = useMapStore();

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchInput = useCallback(
    (value: string) => {
      setSearchQuery(value);

      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      if (!value || value.length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setSearchLoading(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/smart-search?q=${encodeURIComponent(value)}&limit=10`,
            { cache: 'no-store' }
          );
          if (!res.ok) throw new Error();
          const data = await res.json();

          if (data.results?.length > 0) {
            setSearchResults(data.results);
            setShowSearchResults(true);
            setSearchLoading(false);
            return;
          }

          const nominatimRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&countrycodes=tr&limit=5&q=${encodeURIComponent(value)}&addressdetails=1`,
            { headers: { 'Accept-Language': 'tr' } }
          );

          if (nominatimRes.ok) {
            const places = await nominatimRes.json();
            setSearchResults(places);
          } else {
            setSearchResults([]);
          }
          setShowSearchResults(true);
        } catch {
          setSearchResults([]);
          setShowSearchResults(false);
        } finally {
          setSearchLoading(false);
        }
      }, 300);
    },
    [setSearchQuery, setSearchResults, setSearchLoading, setShowSearchResults]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setSearchPin(null);
  }, [setSearchQuery, setSearchResults, setShowSearchResults, setSearchPin]);

  return {
    searchQuery,
    handleSearchInput,
    clearSearch,
  };
}
