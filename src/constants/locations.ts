import { LocationReference } from '@shared/types/index.js';

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
