import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LocationReference } from '@shared/types/index.js';
import { PRESET_METEOROLOGICAL_REGIONS } from '../constants/locations.js';

interface LocationContextType {
  currentLocation: LocationReference;
  availableLocations: LocationReference[];
  setCurrentLocation: (loc: LocationReference) => void;
  selectLocationById: (id: string) => void;
  detectUserLocation: () => Promise<void>;
  isDetectingLocation: boolean;
  locationPermissionState: 'prompt' | 'granted' | 'denied' | 'unsupported';
  isGpsDetected: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Helper function to reverse-geocode coordinates into real human-readable place names
async function reverseGeocodeCoordinates(latitude: number, longitude: number): Promise<{
  city: string;
  district: string;
  state: string;
  country: string;
}> {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (response.ok) {
      const data = await response.json();
      const city = data.locality || data.city || data.principalSubdivision || 'Detected Location';
      const district = data.city || data.locality || 'Local District';
      const state = data.principalSubdivision || 'Regional Sector';
      const country = data.countryName || 'India';
      return { city, district, state, country };
    }
  } catch {
    // Continue to fallback
  }

  return {
    city: `Sector (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`,
    district: `Sector (${latitude.toFixed(2)}°N)`,
    state: 'India',
    country: 'India',
  };
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [locations, setLocations] = useState<LocationReference[]>(() => {
    try {
      const saved = localStorage.getItem('error404_saved_locations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.coordinates?.latitude) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return PRESET_METEOROLOGICAL_REGIONS;
  });

  const [currentLocation, setCurrentLocationState] = useState<LocationReference>(() => {
    try {
      const savedCur = localStorage.getItem('error404_current_location');
      if (savedCur) {
        const parsed = JSON.parse(savedCur);
        if (parsed && parsed.coordinates && typeof parsed.coordinates.latitude === 'number' && parsed.district) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return PRESET_METEOROLOGICAL_REGIONS[0];
  });

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationPermissionState, setLocationPermissionState] = useState<
    'prompt' | 'granted' | 'denied' | 'unsupported'
  >('prompt');
  const [isGpsDetected, setIsGpsDetected] = useState<boolean>(() => {
    return currentLocation?.id === 'loc-detected-gps';
  });

  const safeCurrentLocation: LocationReference = (currentLocation && currentLocation.coordinates)
    ? currentLocation
    : PRESET_METEOROLOGICAL_REGIONS[0];

  const setCurrentLocation = (loc: LocationReference) => {
    if (!loc || !loc.coordinates) return;
    setCurrentLocationState(loc);
    setIsGpsDetected(loc.id === 'loc-detected-gps');
    try {
      localStorage.setItem('error404_current_location', JSON.stringify(loc));
    } catch {
      // ignore
    }
  };

  const selectLocationById = (id: string) => {
    const found = locations.find((loc) => loc.id === id);
    if (found) {
      setCurrentLocation(found);
    }
  };

  const detectUserLocation = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationPermissionState('unsupported');
      return;
    }

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, altitude } = position.coords;
          setLocationPermissionState('granted');

          // Reverse geocode to get real human place name (City, District, State)
          const { city, district, state, country } = await reverseGeocodeCoordinates(
            latitude,
            longitude
          );

          const gridCode = `GRID_${Math.round(latitude * 100)}_${Math.round(longitude * 100)}`;

          const detectedLocation: LocationReference = {
            id: 'loc-detected-gps',
            name: `${city} Real-Time Weather Sector`,
            district: district || city,
            state: state,
            country: country,
            coordinates: {
              latitude: Number(latitude.toFixed(4)),
              longitude: Number(longitude.toFixed(4)),
              altitudeMeters: altitude ? Math.round(altitude) : 120,
            },
            gridId: gridCode,
          };

          setCurrentLocation(detectedLocation);

          setLocations((prev) => {
            const filtered = prev.filter((l) => l.id !== 'loc-detected-gps');
            const updated = [detectedLocation, ...filtered];
            try {
              localStorage.setItem('error404_saved_locations', JSON.stringify(updated));
            } catch {
              // ignore
            }
            return updated;
          });
        } catch {
          // Geocode error
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.warn('Geolocation access declined or unavailable:', error.message);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermissionState('denied');
        }
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  // Automatically request / detect user location on initial app entry
  useEffect(() => {
    const hasAlreadyAsked = sessionStorage.getItem('error404_geo_requested');
    if (!hasAlreadyAsked) {
      sessionStorage.setItem('error404_geo_requested', 'true');
      detectUserLocation();
    }
  }, [detectUserLocation]);

  return (
    <LocationContext.Provider
      value={{
        currentLocation: safeCurrentLocation,
        availableLocations: locations,
        setCurrentLocation,
        selectLocationById,
        detectUserLocation,
        isDetectingLocation,
        locationPermissionState,
        isGpsDetected,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
