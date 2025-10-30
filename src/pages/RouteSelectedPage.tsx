import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Clock, MapPin, Navigation } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { useTripData } from '../hooks/useTripData';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

interface RouteSelectedPageProps {
  onTabChange?: (tab: string) => void;
  onBack?: () => void;
  onNavigateToDateSelection?: () => void;
}

export const RouteSelectedPage: React.FC<RouteSelectedPageProps> = ({ onTabChange, onBack, onNavigateToDateSelection }) => {
  const { tripData } = useTripData();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  
  // Estado para dados da rota
  const [routeData, setRouteData] = useState({
    duration: 'Calculando...',
    distance: 'Calculando...',
    description: 'Rota mais rápida'
  });

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  const handleContinue = () => {
    console.log('Continuar com rota:', routeData);
    onNavigateToDateSelection?.();
  };

  // Função para simplificar endereços
  const getShortAddress = (fullAddress: string): string => {
    const parts = fullAddress.split(',').map(part => part.trim());
    const city = parts[0];
    const state = parts.find(p => p.includes('São Paulo')) || parts[parts.length - 1];
    
    if (city && state && city !== state) {
      return `${city}, ${state}`;
    }
    return city || fullAddress;
  };

  // Função para calcular distância entre dois pontos (Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Função para formatar tempo
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
  };

  // Função para formatar distância
  const formatDistance = (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    } else {
      return `${km.toFixed(1)} km`;
    }
  };

  // Inicializar o mapa com roteamento
  useEffect(() => {
    if (!mapRef.current || !tripData) return;

    // Limpar mapa anterior se existir
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Criar mapa
    const map = L.map(mapRef.current).setView(
      [tripData.departure.latitude, tripData.departure.longitude], 
      13
    );

    // Adicionar camada de tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Leaflet | © OpenStreetMap contributors'
    }).addTo(map);

    // Calcular distância em linha reta para estimativa inicial
    const straightDistance = calculateDistance(
      tripData.departure.latitude, 
      tripData.departure.longitude,
      tripData.destination.latitude, 
      tripData.destination.longitude
    );

    // Estimar tempo baseado na distância (assumindo velocidade média de 50 km/h)
    const estimatedTime = (straightDistance / 50) * 60;

    // Atualizar dados da rota com estimativa
    setRouteData({
      duration: formatDuration(estimatedTime),
      distance: formatDistance(straightDistance),
      description: 'Rota mais rápida'
    });

    // Adicionar marcadores personalizados
    const departureIcon = L.divIcon({
      className: 'custom-div-icon',
      html: '<div style="background-color: red; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const destinationIcon = L.divIcon({
      className: 'custom-div-icon',
      html: '<div style="background-color: blue; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    // Marcador de partida
    L.marker([tripData.departure.latitude, tripData.departure.longitude], {
      icon: departureIcon
    }).addTo(map).bindPopup(`<b>Partida:</b><br>${tripData.departure.address}`);

    // Marcador de destino
    L.marker([tripData.destination.latitude, tripData.destination.longitude], {
      icon: destinationIcon
    }).addTo(map).bindPopup(`<b>Destino:</b><br>${tripData.destination.address}`);

    // Configurar roteamento
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(tripData.departure.latitude, tripData.departure.longitude),
        L.latLng(tripData.destination.latitude, tripData.destination.longitude)
      ],
      routeWhileDragging: false,
      lineOptions: {
        styles: [{ color: 'blue', weight: 4, opacity: 0.8 }],
        extendToWaypoints: false,
        missingRouteTolerance: 10
      },
      addWaypoints: false,
      fitSelectedRoutes: true,
      show: false, // Esconder o painel de roteamento
      router: L.Routing.osrmv1({
        serviceUrl: 'https://routing.openstreetmap.de/routed-car/route/v1',
        profile: 'driving'
      })
    }).addTo(map);

    // Escutar eventos de roteamento para obter dados reais
    routingControl.on('routesfound', function(e: any) {
      const routes = e.routes;
      if (routes && routes.length > 0) {
        const route = routes[0];
        const distance = route.summary.totalDistance / 1000; // Converter para km
        const duration = route.summary.totalTime / 60; // Converter para minutos

        setRouteData({
          duration: formatDuration(duration),
          distance: formatDistance(distance),
          description: 'Rota mais rápida'
        });

        // Persistir duração em minutos para ser usada no cálculo do endTime
        try {
          const rounded = Math.round(duration);
          localStorage.setItem('routeDurationMinutes', String(rounded));
        } catch (_) {
          // noop
        }
      }
    });

    routingControlRef.current = routingControl;
    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [tripData]);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header com botão voltar */}
      <div className="flex items-center p-3">
        <button 
          onClick={onBack}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Trajeto selecionado</h1>
      </div>

      {/* Mapa real */}
      <div className="relative h-96 border-b border-gray-200">
        <div 
          ref={mapRef} 
          className="w-full h-full"
          style={{ minHeight: '384px' }}
        />
        {!tripData && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p>Carregando mapa...</p>
            </div>
          </div>
        )}
      </div>

      {/* Informações da rota */}
      <div className="px-6 py-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Navigation className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-900">Rota mais rápida</span>
            </div>
            <span className="text-sm text-blue-700">{routeData.description}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-blue-800">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{routeData.duration}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{routeData.distance}</span>
            </div>
          </div>
          
          {tripData && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="text-xs text-blue-700 space-y-1">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span><strong>Partida:</strong> {getShortAddress(tripData.departure.address)}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span><strong>Destino:</strong> {getShortAddress(tripData.destination.address)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botão Continuar - Fixo na parte inferior */}
      <div className="fixed bottom-20 left-0 right-0 px-6 bg-white py-4">
        <button
          onClick={handleContinue}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Continuar
        </button>
      </div>

      <BottomNav 
        activeTab="create"
        onTabChange={handleTabChange}
      />
    </div>
  );
};
