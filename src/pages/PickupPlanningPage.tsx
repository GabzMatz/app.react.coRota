import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { BottomNav } from '../components/BottomNav';
import { rideService, type MeetingPoint, type MeetingPointSuggestion } from '../services/rideService';
import { useToast } from '../contexts/ToastContext';

type PickupPoint = { userId: string; address: string; lat: number; long: number };

interface PickupPlanningPageProps {
  rideId: string;
  onBack: () => void;
  onSaved?: (data: { pickupMode: 'meeting_point' | 'street_by_street'; meetingPoint: MeetingPoint | null }) => void;
}

export const PickupPlanningPage: React.FC<PickupPlanningPageProps> = ({ rideId, onBack, onSaved }) => {
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(true);
  const [pickupMode, setPickupMode] = useState<'meeting_point' | 'street_by_street'>('meeting_point');
  const [driverPoint, setDriverPoint] = useState<{ lat: number; long: number; address: string } | null>(null);
  const [destinationPoint, setDestinationPoint] = useState<{ lat: number; long: number } | null>(null);
  const [passengerPoints, setPassengerPoints] = useState<PickupPoint[]>([]);
  const [suggestions, setSuggestions] = useState<MeetingPointSuggestion[]>([]);
  const [selectedMeetingPoint, setSelectedMeetingPoint] = useState<MeetingPoint | null>(null);
  const [saving, setSaving] = useState(false);
  const [routeSummary, setRouteSummary] = useState<{ durationLabel: string; distanceLabel: string }>({
    durationLabel: '--',
    distanceLabel: '--'
  });
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);

  const waypoints = useMemo(() => {
    if (!driverPoint || !destinationPoint) return [];
    if (pickupMode === 'street_by_street') {
      const stops = passengerPoints.map((point) => L.latLng(point.lat, point.long));
      return [L.latLng(driverPoint.lat, driverPoint.long), ...stops, L.latLng(destinationPoint.lat, destinationPoint.long)];
    }
    if (selectedMeetingPoint) {
      return [
        L.latLng(driverPoint.lat, driverPoint.long),
        L.latLng(selectedMeetingPoint.lat, selectedMeetingPoint.long),
        L.latLng(destinationPoint.lat, destinationPoint.long),
      ];
    }
    return [L.latLng(driverPoint.lat, driverPoint.long), L.latLng(destinationPoint.lat, destinationPoint.long)];
  }, [driverPoint, destinationPoint, passengerPoints, pickupMode, selectedMeetingPoint]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const context = await rideService.getPickupContext(rideId);
        const ride = context.ride;
        if (!ride?.departureLatLng || !ride?.destinationLatLng) {
          throw new Error('Não foi possível carregar os pontos da corrida.');
        }

        setPickupMode(ride.pickupMode === 'street_by_street' ? 'street_by_street' : 'meeting_point');
        setSelectedMeetingPoint(ride.meetingPoint || null);
        setDriverPoint({
          lat: Number(ride.departureLatLng[0]),
          long: Number(ride.departureLatLng[1]),
          address: 'Origem do motorista',
        });
        setDestinationPoint({
          lat: Number(ride.destinationLatLng[0]),
          long: Number(ride.destinationLatLng[1]),
        });
        setPassengerPoints(
          (context.passengerPickups || []).filter(
            (point) =>
              Number.isFinite(point.lat) &&
              Number.isFinite(point.long) &&
              !(point.lat === 0 && point.long === 0)
          )
        );

        const suggested = await rideService.suggestMeetingPoints(rideId);
        setSuggestions(suggested);
        if (!ride.meetingPoint && suggested.length > 0) {
          setSelectedMeetingPoint(suggested[0]);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao carregar planejamento de embarque.';
        showError(message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [rideId, showError]);

  useEffect(() => {
    if (!mapRef.current || !driverPoint) return;
    let map = mapInstanceRef.current;
    if (!map) {
      const container = mapRef.current as HTMLDivElement & { _leaflet_id?: number };
      if (container._leaflet_id) {
        delete container._leaflet_id;
      }

      map = L.map(container).setView([driverPoint.lat, driverPoint.long], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      mapInstanceRef.current = map;
      markerLayerRef.current = L.layerGroup().addTo(map);
    }

    map.setView([driverPoint.lat, driverPoint.long], 12);
    markerLayerRef.current?.clearLayers();

    L.marker([driverPoint.lat, driverPoint.long]).addTo(markerLayerRef.current!).bindPopup('Motorista');
    passengerPoints.forEach((point) => {
      L.circleMarker([point.lat, point.long], { radius: 6, color: '#2563eb' })
        .addTo(markerLayerRef.current!)
        .bindPopup(`Passageiro: ${point.address}`);
    });

    if (pickupMode === 'meeting_point' && selectedMeetingPoint) {
      L.circleMarker([selectedMeetingPoint.lat, selectedMeetingPoint.long], { radius: 7, color: '#16a34a' })
        .addTo(markerLayerRef.current!)
        .bindPopup(`Encontro: ${selectedMeetingPoint.street}`);
    }

    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
    if (waypoints.length >= 2) {
      routingControlRef.current = L.Routing.control({
        waypoints,
        routeWhileDragging: false,
        addWaypoints: false,
        fitSelectedRoutes: true,
        show: false,
      }).addTo(map);

      routingControlRef.current.on('routesfound', (event: { routes?: Array<{ summary?: { totalTime?: number; totalDistance?: number } }> }) => {
        const route = event.routes?.[0];
        const totalTimeSeconds = Number(route?.summary?.totalTime ?? 0);
        const totalDistanceMeters = Number(route?.summary?.totalDistance ?? 0);

        const minutes = Math.round(totalTimeSeconds / 60);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        const durationLabel = hours > 0
          ? `${hours}h ${remainingMinutes.toString().padStart(2, '0')}min`
          : `${Math.max(minutes, 1)} min`;

        const distanceKm = totalDistanceMeters / 1000;
        const distanceLabel = distanceKm >= 1
          ? `${distanceKm.toFixed(1)} km`
          : `${Math.max(Math.round(totalDistanceMeters), 1)} m`;

        setRouteSummary({ durationLabel, distanceLabel });
      });
    } else {
      setRouteSummary({ durationLabel: '--', distanceLabel: '--' });
    }
  }, [driverPoint, passengerPoints, pickupMode, selectedMeetingPoint, waypoints]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        if (routingControlRef.current) {
          mapInstanceRef.current.removeControl(routingControlRef.current);
          routingControlRef.current = null;
        }
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const savePickupPlan = async () => {
    if (pickupMode === 'meeting_point' && !selectedMeetingPoint) {
      showError('Selecione um ponto de encontro para continuar.');
      return;
    }

    try {
      setSaving(true);
      await rideService.updatePickupPlan(rideId, {
        pickupMode,
        meetingPoint: pickupMode === 'meeting_point' ? selectedMeetingPoint : null
      });
      showSuccess('Plano de embarque salvo.');
      onSaved?.({ pickupMode, meetingPoint: pickupMode === 'meeting_point' ? selectedMeetingPoint : null });
      onBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar plano de embarque.';
      showError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="flex items-center p-3 border-b border-gray-200">
        <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Planejar embarque</h1>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500">Carregando mapa...</div>
      ) : (
        <>
          <div ref={mapRef} className="w-full h-80 border-b border-gray-200" />
          <div className="p-4 space-y-4">
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-sm font-semibold text-gray-900 mb-2">Tipo de embarque</p>
              <label className="flex items-center gap-2 text-sm mb-2">
                <input type="radio" checked={pickupMode === 'meeting_point'} onChange={() => setPickupMode('meeting_point')} />
                Ponto de encontro com todos
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={pickupMode === 'street_by_street'} onChange={() => setPickupMode('street_by_street')} />
                Passar nas ruas dos passageiros
              </label>
            </div>

            {pickupMode === 'meeting_point' && (
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-sm font-semibold text-gray-900 mb-2">Pontos sugeridos</p>
                {suggestions.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhuma sugestão disponível.</p>
                ) : (
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.street}-${index}`}
                        onClick={() => setSelectedMeetingPoint(suggestion)}
                        className={`w-full text-left p-2 rounded border ${selectedMeetingPoint?.lat === suggestion.lat && selectedMeetingPoint?.long === suggestion.long ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      >
                        <p className="text-sm font-medium text-gray-900">{suggestion.street}</p>
                        <p className="text-xs text-gray-600">{suggestion.city} - {suggestion.state}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                <Navigation size={16} /> Endereços usados na busca
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                {passengerPoints.map((point) => (
                  <li key={`${point.userId}-${point.lat}-${point.long}`}>{point.address || `${point.lat.toFixed(5)}, ${point.long.toFixed(5)}`}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm font-semibold text-blue-900">Estimativa da corrida</p>
              <p className="text-sm text-blue-800 mt-1">
                Tempo total: <strong>{routeSummary.durationLabel}</strong>
              </p>
              <p className="text-sm text-blue-800">
                Distancia total: <strong>{routeSummary.distanceLabel}</strong>
              </p>
            </div>

            <button
              onClick={savePickupPlan}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar planejamento'}
            </button>
          </div>
        </>
      )}

      <BottomNav activeTab="routes" onTabChange={() => undefined} />
    </div>
  );
};

