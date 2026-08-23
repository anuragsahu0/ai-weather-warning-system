import { Region } from '@shared/types/index.js';
import { prisma } from '../../config/db.js';

export const PRESET_REGIONS: Region[] = [
  {
    id: 'region-delhi-ncr',
    code: 'DELHI_NCR',
    name: 'Delhi National Capital Region',
    type: 'CITY',
    parentRegionId: null,
    boundingBox: {
      north: 28.9,
      south: 28.3,
      east: 77.4,
      west: 76.9,
    },
    centerCoordinates: {
      latitude: 28.6139,
      longitude: 77.209,
    },
    totalGridsCount: 3000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'region-mumbai-mmr',
    code: 'MUMBAI_MMR',
    name: 'Mumbai Metropolitan Region',
    type: 'CITY',
    parentRegionId: null,
    boundingBox: {
      north: 19.3,
      south: 18.7,
      east: 73.1,
      west: 72.7,
    },
    centerCoordinates: {
      latitude: 18.922,
      longitude: 72.8347,
    },
    totalGridsCount: 2400,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'region-dehradun-val',
    code: 'DEHRADUN_VALLEY',
    name: 'Dehradun Himalayan Foothills',
    type: 'DISTRICT',
    parentRegionId: null,
    boundingBox: {
      north: 30.6,
      south: 30.0,
      east: 78.3,
      west: 77.8,
    },
    centerCoordinates: {
      latitude: 30.3165,
      longitude: 78.0322,
    },
    totalGridsCount: 3000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'region-kolkata-cyclone',
    code: 'KOLKATA_GANGETIC',
    name: 'Kolkata Gangetic Delta',
    type: 'CITY',
    parentRegionId: null,
    boundingBox: {
      north: 22.8,
      south: 22.3,
      east: 88.6,
      west: 88.1,
    },
    centerCoordinates: {
      latitude: 22.5726,
      longitude: 88.3639,
    },
    totalGridsCount: 2500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'region-bengaluru-tech',
    code: 'BENGALURU_URBAN',
    name: 'Bengaluru Urban Plateau',
    type: 'CITY',
    parentRegionId: null,
    boundingBox: {
      north: 13.2,
      south: 12.7,
      east: 77.8,
      west: 77.3,
    },
    centerCoordinates: {
      latitude: 12.9716,
      longitude: 77.5946,
    },
    totalGridsCount: 2500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class RegionService {
  async getAllRegions(): Promise<Region[]> {
    try {
      const dbRegions = await prisma.region.findMany();
      if (dbRegions.length > 0) {
        return dbRegions.map((r) => ({
          id: r.id,
          code: r.code,
          name: r.name,
          type: r.type as Region['type'],
          parentRegionId: r.parentRegionId,
          boundingBox: {
            north: r.northLat,
            south: r.southLat,
            east: r.eastLng,
            west: r.westLng,
          },
          centerCoordinates: {
            latitude: r.centerLat,
            longitude: r.centerLng,
          },
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        }));
      }
    } catch {
      // Fallback to preset regions if DB offline
    }
    return PRESET_REGIONS;
  }

  findRegionByCoordinates(latitude: number, longitude: number): Region | null {
    for (const region of PRESET_REGIONS) {
      const b = region.boundingBox;
      if (latitude >= b.south && latitude <= b.north && longitude >= b.west && longitude <= b.east) {
        return region;
      }
    }
    return null;
  }

  getRegionById(id: string): Region | undefined {
    return PRESET_REGIONS.find((r) => r.id === id || r.code === id);
  }
}

export const regionService = new RegionService();
