import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LocationReference } from '@shared/types/index.js';

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

export const PRESET_METEOROLOGICAL_REGIONS: LocationReference[] = [
  {
    id: 'loc-delhi-ncr',
    name: 'Delhi NCR Convective Radar Zone',
    district: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    coordinates: { latitude: 28.6139, longitude: 77.209, altitudeMeters: 216 },
    gridId: 'GRID-DEL-001',
  },
  {
    id: 'loc-mumbai-mmr',
    name: 'Mumbai Coastal Radar Cell',
    district: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    coordinates: { latitude: 18.922, longitude: 72.8347, altitudeMeters: 14 },
    gridId: 'GRID-BOM-002',
  },
  {
    id: 'loc-dehradun-val',
    name: 'Dehradun Cloudburst Sensitive Valley',
    district: 'Dehradun',
    state: 'Uttarakhand',
    country: 'India',
    coordinates: { latitude: 30.3165, longitude: 78.0322, altitudeMeters: 450 },
    gridId: 'GRID-UKD-003',
  },
  {
    id: 'loc-kolkata-cyclone',
    name: 'Kolkata Bay Gangetic Radar Sector',
    district: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    coordinates: { latitude: 22.5726, longitude: 88.3639, altitudeMeters: 9 },
    gridId: 'GRID-CCU-004',
  },
  {
    id: 'loc-bengaluru-tech',
    name: 'Bengaluru Urban Convection Grid',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    country: 'India',
    coordinates: { latitude: 12.9716, longitude: 77.5946, altitudeMeters: 920 },
    gridId: 'GRID-BLR-005',
  },
];

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Helper function to reverse-geocode coordinates into real human-readable place names
async function reverseGeocodeCoordinates(latitude: number, longitude: number): Promise<{
  city: string;
  district: string;
  state: string;
  country: string;
}> {
  try {
    // 1. Try BigDataCloud open reverse geocoding API (Fast, reliable, CORS enabled, no API key needed)
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

  try {
    // 2. Try OpenStreetMap Nominatim reverse geocode fallback
    const nomResponse = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
    );
    if (nomResponse.ok) {
      const nomData = await nomResponse.json();
      const addr = nomData.address || {};
      const city = addr.city || addr.town || addr.village || addr.suburb || 'Local Sector';
      const district = addr.county || addr.district || addr.city || 'Local District';
      const state = addr.state || 'Region';
      const country = addr.country || 'India';
      return { city, district, state, country };
    }
  } catch {
    // Continue to generic fallback
  }

  // Generic fallback if network is offline
  return {
    city: `Sector (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`,
    district: `Lat ${latitude.toFixed(2)}°N`,
    state: `Lon ${longitude.toFixed(2)}°E`,
    country: 'India',
  };
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [locations, setLocations] = useState<LocationReference[]>(() => {
    try {
      const saved = localStorage.getItem('error404_saved_locations');
      if (saved) {
        return JSON.parse(saved);
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
        return JSON.parse(savedCur);
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
    return currentLocation.id === 'loc-detected-gps';
  });

  const setCurrentLocation = (loc: LocationReference) => {
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

          // Update current location and prepend to available locations
          setCurrentLocationState(detectedLocation);
          setIsGpsDetected(true);

          setLocations((prev) => {
            const filtered = prev.filter((l) => l.id !== 'loc-detected-gps');
            const updated = [detectedLocation, ...filtered];
            try {
              localStorage.setItem('error404_saved_locations', JSON.stringify(updated));
              localStorage.setItem('error404_current_location', JSON.stringify(detectedLocation));
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
        currentLocation,
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
