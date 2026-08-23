import { useState } from 'react';
import { ConsumerWeatherHero } from '../components/weather/ConsumerWeatherHero.js';
import { HourlyTemperatureCurve } from '../components/weather/HourlyTemperatureCurve.js';
import { AirQualityWidget } from '../components/weather/AirQualityWidget.js';
import { HealthActivitiesWidget } from '../components/weather/HealthActivitiesWidget.js';
import { LiveMapContainer } from '../components/map/LiveMapContainer.js';
import { DashboardRiskOverview } from '../components/risk/DashboardRiskOverview.js';
import { AttributionFooter } from '../components/weather/AttributionFooter.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '../components/ui/Dialog.js';
import {
  MapPin,
  Radio,
  Navigation,
  Cpu,
  Calendar,
} from 'lucide-react';
import { useLocation } from '../context/LocationContext.js';
import { useCurrentWeather } from '../hooks/useCurrentWeather.js';
import { useSpatioTemporalNowcast } from '../hooks/useSpatioTemporalNowcast.js';

export function DashboardPage() {
  const {
    currentLocation,
    availableLocations,
    selectLocationById,
    detectUserLocation,
    isDetectingLocation,
  } = useLocation();
  const { weather } = useCurrentWeather();
  const { nowcast } = useSpatioTemporalNowcast(30);

  const [activeTab, setActiveTab] = useState<'today' | 'hourly' | 'radar' | 'risk' | 'tenday'>('today');
  const [showLocationModal, setShowLocationModal] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Main Weather Content Grid (2 Columns: Main Column + Right Widgets matching screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 of 12 cols = 66% width) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Controls, Title & Atmospheric Purple Hero Card */}
          <ConsumerWeatherHero
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenLocationModal={() => setShowLocationModal(true)}
          />

          {/* Today's Outlook & Hourly Spline Curve (Visible in Today & Hourly tabs) */}
          {(activeTab === 'today' || activeTab === 'hourly') && (
            <HourlyTemperatureCurve />
          )}

          {/* AI ConvLSTM Nowcasting View */}
          {activeTab === 'hourly' && (
            <Card className="bg-white border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm uppercase">
                    ERROR 404 ConvLSTM Convective Nowcasting (0–60 Min Horizon)
                  </h3>
                </div>
                <Badge variant="operational">MPS ACCELERATED (12ms)</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {nowcast?.horizons?.map((h) => (
                  <div key={h.horizonMinutes} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-xs font-bold text-blue-600 font-mono block">+{h.horizonMinutes} min</span>
                    <span className="text-xl font-extrabold text-slate-900 block">{h.expectedRainfall.toFixed(1)} mm/h</span>
                    <span className="text-[10px] text-slate-500 block">
                      Prob: {Math.round(h.eventProbabilities.heavyRain * 100)}% • ±{h.uncertaintyScore}
                    </span>
                  </div>
                )) || (
                  <div className="col-span-4 p-4 text-center text-slate-500 text-xs font-mono">
                    Generating multi-horizon predictions for {currentLocation.district}...
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* 1.1km Interactive Radar Map View */}
          {activeTab === 'radar' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-blue-600" /> Full-Screen Live Doppler Radar
                </h3>
                <Badge variant="operational">1.1km PostGIS Grid Mosaic</Badge>
              </div>
              <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-md h-[550px]">
                <LiveMapContainer />
              </div>
            </div>
          )}

          {/* Risk Intelligence View */}
          {activeTab === 'risk' && (
            <div className="space-y-4">
              <DashboardRiskOverview />
            </div>
          )}

          {/* 10-Day Forecast Outlook View */}
          {activeTab === 'tenday' && (
            <Card className="bg-white border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm uppercase">
                    10-Day Synoptic Weather Outlook • {currentLocation.district}
                  </h3>
                </div>
                <Badge variant="secondary">ECMWF IFS Synoptic Ensemble</Badge>
              </div>

              <div className="space-y-2.5">
                {[
                  { day: 'Today', date: 'Jul 28', tempMax: 88, tempMin: 80, condition: 'Mist / Thunderstorms', rainProb: 8 },
                  { day: 'Tomorrow', date: 'Jul 29', tempMax: 87, tempMin: 79, condition: 'Heavy Rain Showers', rainProb: 65 },
                  { day: 'Wed', date: 'Jul 30', tempMax: 86, tempMin: 78, condition: 'Scattered Thunderstorms', rainProb: 45 },
                  { day: 'Thu', date: 'Jul 31', tempMax: 89, tempMin: 80, condition: 'Partly Cloudy', rainProb: 20 },
                  { day: 'Fri', date: 'Aug 01', tempMax: 91, tempMin: 81, condition: 'Mainly Clear', rainProb: 10 },
                  { day: 'Sat', date: 'Aug 02', tempMax: 88, tempMin: 79, condition: 'Afternoon Rain', rainProb: 40 },
                ].map((item) => (
                  <div key={item.day} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
                    <div className="w-24">
                      <span className="font-bold text-slate-900 text-xs block">{item.day}</span>
                      <span className="text-[10px] text-slate-500">{item.date}</span>
                    </div>

                    <div className="flex-1 text-xs text-slate-700 font-medium">
                      {item.condition}
                    </div>

                    <div className="text-xs font-mono font-bold text-blue-600 w-16 text-right">
                      {item.rainProb}% rain
                    </div>

                    <div className="text-xs font-mono font-bold text-slate-900 w-20 text-right">
                      {item.tempMax}° / <span className="text-slate-500">{item.tempMin}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column (4 of 12 cols = 34% width matching screenshot) */}
        <div className="lg:col-span-4 space-y-6 pt-10 lg:pt-14">
          {/* 1. Air Quality Index Card */}
          <AirQualityWidget />

          {/* 2. Health & Activities Card */}
          <HealthActivitiesWidget />
        </div>
      </div>

      {/* 2. Attribution Footer */}
      <div className="pt-8">
        <AttributionFooter
          providerName={weather?.attribution?.providerName || 'Open-Meteo Weather API'}
          sourceUrl={weather?.attribution?.sourceUrl || 'https://open-meteo.com/'}
          license={weather?.attribution?.license || 'WMO & National Weather Services Open Meteorological Data'}
        />
      </div>

      {/* Location Selector Modal */}
      <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
        <DialogClose onClick={() => setShowLocationModal(false)} />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <MapPin className="h-5 w-5 text-blue-600" />
            Select Weather Location
          </DialogTitle>
          <DialogDescription>
            Use your device GPS to fetch real-time weather for your exact coordinates, or choose a preset Indian radar sector.
          </DialogDescription>
        </DialogHeader>

        {/* GPS Live Location Trigger Button */}
        <div className="pt-3 pb-2 border-b border-slate-200">
          <Button
            variant="default"
            className="w-full h-11 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 shadow-md"
            onClick={async () => {
              await detectUserLocation();
              setShowLocationModal(false);
            }}
            disabled={isDetectingLocation}
          >
            <Navigation className={`w-4 h-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
            {isDetectingLocation ? 'Detecting your live GPS Location...' : 'Use My Current GPS Location'}
          </Button>
        </div>

        <div className="space-y-2.5 mt-3 max-h-80 overflow-y-auto pr-1">
          {availableLocations.map((loc) => {
            const isSelected = loc.id === currentLocation.id;
            const isGpsLoc = loc.id === 'loc-detected-gps';
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => {
                  selectLocationById(loc.id);
                  setShowLocationModal(false);
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm ring-1 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    isSelected
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isGpsLoc ? <Navigation className="w-4 h-4 shrink-0" /> : <MapPin className="w-4 h-4 shrink-0" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {loc.district}, {loc.state}
                      {isGpsLoc && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                          DETECTED GPS
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-blue-600 font-medium mt-0.5">{loc.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      Coordinates: {loc.coordinates.latitude.toFixed(4)}°N, {loc.coordinates.longitude.toFixed(4)}°E • Alt: {loc.coordinates.altitudeMeters}m
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant={isSelected ? 'operational' : 'secondary'} className="font-mono text-[10px]">
                    {loc.gridId}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      </Dialog>
    </div>
  );
}
