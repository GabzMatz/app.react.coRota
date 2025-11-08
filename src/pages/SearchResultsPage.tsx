import React, { useState, useEffect } from 'react';
import { SearchResultCard } from '../components/SearchResultCard';
import { BottomNav } from '../components/BottomNav';
import { userService } from '../services/userService';

interface SearchResultsPageProps {
  rides?: any[];
  onTabChange?: (tab: string) => void;
  onPageChange?: (page: string, rideData?: any) => void;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ rides = [], onTabChange, onPageChange }) => {
  const [ridesWithDriverData, setRidesWithDriverData] = useState<any[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  // Função para buscar endereço via reverse geocoding
  const getAddressFromCoordinates = async (lat: number, lon: number): Promise<string> => {
    try {
      // Usar Photon para reverse geocoding (CORS-friendly)
      const response = await fetch(
        `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`
      );
      
      if (!response.ok) {
        return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
      }
      
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const props = data.features[0].properties;
        const addressParts = [
          props.name,
          props.street,
          props.housenumber,
          props.city || props.town || props.village,
          props.state,
          props.country
        ].filter(Boolean);
        
        return addressParts.length > 0 ? addressParts.join(', ') : `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
      }
      
      return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    } catch (error) {
      console.error('Erro no reverse geocoding:', error);
      return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }
  };

  // Função para transformar dados da API no formato esperado pela RideDetailsPage
  const transformRideData = async (ride: any) => {
    let departureAddress = 'Endereço não disponível';
    let departureLocation = 'Local de partida';
    let arrivalAddress = 'Endereço não disponível';
    let arrivalLocation = 'Local de destino';
    
    // Para partida - usar coordenadas da corrida para buscar endereço
    if (ride.departureLatLng && ride.departureLatLng.length === 2) {
      try {
        departureAddress = await getAddressFromCoordinates(ride.departureLatLng[0], ride.departureLatLng[1]);
        departureLocation = departureAddress.split(',')[0] || departureLocation;
      } catch (e) {
        // Fallback para endereços salvos do usuário
        const selectedDeparture = localStorage.getItem('selectedAddress');
        if (selectedDeparture) {
          try {
            const departureData = JSON.parse(selectedDeparture);
            departureAddress = departureData.address || departureAddress;
            departureLocation = departureData.address?.split(',')[0] || departureLocation;
          } catch (e2) {
            // Se falhar tudo, usar coordenadas
            departureAddress = `${ride.departureLatLng[0].toFixed(6)}, ${ride.departureLatLng[1].toFixed(6)}`;
          }
        }
      }
    }
    
    // Para destino - usar coordenadas da corrida para buscar endereço
    if (ride.destinationLatLng && ride.destinationLatLng.length === 2) {
      try {
        arrivalAddress = await getAddressFromCoordinates(ride.destinationLatLng[0], ride.destinationLatLng[1]);
        arrivalLocation = arrivalAddress.split(',')[0] || arrivalLocation;
      } catch (e) {
        // Fallback para endereços salvos do usuário
        const selectedDestination = localStorage.getItem('selectedDestination');
        if (selectedDestination) {
          try {
            const destinationData = JSON.parse(selectedDestination);
            arrivalAddress = destinationData.address || arrivalAddress;
            arrivalLocation = destinationData.address?.split(',')[0] || arrivalLocation;
          } catch (e2) {
            // Se falhar tudo, usar coordenadas
            arrivalAddress = `${ride.destinationLatLng[0].toFixed(6)}, ${ride.destinationLatLng[1].toFixed(6)}`;
          }
        }
      }
    }

    return {
      id: ride.id || ride._id || 0,
      date: formatDate(ride.date),
      departureTime: formatTime(ride.startTime),
      arrivalTime: formatTime(ride.endTime),
      departureLocation: ride.departureLocation || departureLocation,
      departureAddress: ride.departureAddress || departureAddress,
      // departureDistance: 'Distância não calculada', // Mockado - comentado por enquanto
      arrivalLocation: ride.arrivalLocation || arrivalLocation,
      arrivalAddress: ride.destinationAddress || arrivalAddress,
      // arrivalDistance: 'Distância não calculada', // Mockado - comentado por enquanto
      price: formatPrice(ride.pricePerPassenger),
      driverName: ride.driverName || `Motorista ${ride.driverId?.substring(0, 6) || 'N/A'}`,
      driverPhone: ride.driverPhone,
      driverRating: '5,0', // Valor padrão, pode vir da API no futuro
      driverPhoto: ride.driverPhoto,
      maxPassengers: ride.allSeats || ride.availableSeats || 4
    };
  };

  const handleSelectRide = async (ride: any) => {
    console.log('Selecionar carona:', ride);
    try {
      const transformedRide = await transformRideData(ride);
      onPageChange?.('ride-details', transformedRide);
    } catch (error) {
      console.error('Erro ao transformar dados da carona:', error);
      // Em caso de erro, usar dados básicos
      const basicRide = {
        id: ride.id || ride._id || 0,
        date: formatDate(ride.date),
        departureTime: formatTime(ride.startTime),
        arrivalTime: formatTime(ride.endTime),
        departureLocation: 'Local de partida',
        departureAddress: 'Endereço não disponível',
        // departureDistance: 'Distância não calculada', // Mockado - comentado por enquanto
        arrivalLocation: 'Local de destino',
        arrivalAddress: 'Endereço não disponível',
        // arrivalDistance: 'Distância não calculada', // Mockado - comentado por enquanto
        price: formatPrice(ride.pricePerPassenger),
        driverName: ride.driverName || `Motorista ${ride.driverId?.substring(0, 6) || 'N/A'}`,
        driverPhone: ride.driverPhone,
        driverRating: '5,0',
        driverPhoto: ride.driverPhoto,
        maxPassengers: ride.allSeats || ride.availableSeats || 4
      };
      onPageChange?.('ride-details', basicRide);
    }
  };

  // Buscar dados dos motoristas quando as corridas mudarem
  useEffect(() => {
    const fetchDriverData = async () => {
      if (!rides || rides.length === 0) {
        setRidesWithDriverData([]);
        return;
      }

      setLoadingDrivers(true);
      
      try {
        // Buscar dados de todos os motoristas únicos
        const uniqueDriverIds = [...new Set(rides.map(ride => ride.driverId).filter(Boolean))];
        
        // Fazer requisições em paralelo para todos os motoristas
        const driverDataPromises = uniqueDriverIds.map(async (driverId) => {
          try {
            const driverData = await userService.getUserById(driverId);
            return { driverId, driverData };
          } catch (error) {
            console.error(`Erro ao buscar motorista ${driverId}:`, error);
            return { driverId, driverData: null };
          }
        });

        const driverDataResults = await Promise.all(driverDataPromises);
        
        // Criar um mapa de driverId -> driverData para acesso rápido
        const driverMap = new Map(
          driverDataResults
            .filter(result => result.driverData)
            .map(result => [result.driverId, result.driverData])
        );

        // Combinar dados das corridas com dados dos motoristas
        const ridesWithData = rides.map(ride => {
          const driverData = driverMap.get(ride.driverId);
          
          if (driverData) {
            return {
              ...ride,
              driverName: `${driverData.firstName} ${driverData.lastName}`.trim(),
              driverPhoto: ride.driverPhoto || undefined,
              driverPhone: driverData.phone
            };
          }
          
          // Se não encontrar dados do motorista, usar fallback
          return {
            ...ride,
            driverName: `Motorista ${ride.driverId?.substring(0, 6) || 'N/A'}`,
            driverPhoto: ride.driverPhoto || undefined,
            driverPhone: ride.driverPhone
          };
        });

        setRidesWithDriverData(ridesWithData);
      } catch (error) {
        console.error('Erro ao buscar dados dos motoristas:', error);
        // Em caso de erro, usar os dados originais sem informações do motorista
        setRidesWithDriverData(rides.map(ride => ({
          ...ride,
          driverName: `Motorista ${ride.driverId?.substring(0, 6) || 'N/A'}`,
          driverPhoto: ride.driverPhoto || undefined
        })));
      } finally {
        setLoadingDrivers(false);
      }
    };

    fetchDriverData();
  }, [rides]);

  // Função para converter timestamp do Firestore para Date
  const convertFirestoreTimestamp = (timestamp: any): Date | null => {
    if (!timestamp) return null;
    
    // Se for um objeto Firestore com _seconds
    if (timestamp._seconds !== undefined) {
      return new Date(timestamp._seconds * 1000);
    }
    
    // Se for uma string de data
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Se for um número (timestamp em milissegundos)
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    
    return null;
  };

  // Função para formatar data
  const formatDate = (dateInput: any): string => {
    const date = convertFirestoreTimestamp(dateInput);
    
    if (!date) return 'Data não informada';
    
    try {
      const day = date.getDate();
      const month = date.toLocaleDateString('pt-BR', { month: 'long' });
      
      return `${day} de ${month.charAt(0).toUpperCase() + month.slice(1)}`;
    } catch {
      return 'Data não informada';
    }
  };

  // Função para formatar hora (HH:mm)
  const formatTime = (timeString: string | undefined): string => {
    if (!timeString) return '--:--';
    
    // Se já estiver no formato HH:mm, retornar como está
    if (/^\d{2}:\d{2}$/.test(timeString)) {
      return timeString;
    }
    
    // Tentar extrair hora e minuto de diferentes formatos
    const match = timeString.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      const hours = match[1].padStart(2, '0');
      const minutes = match[2];
      return `${hours}:${minutes}`;
    }
    
    return timeString;
  };

  // Função para formatar preço
  const formatPrice = (price: number | string | undefined): string => {
    if (!price) return 'R$ --';
    
    const priceNum = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(priceNum)) return 'R$ --';
    
    return `R$ ${priceNum.toFixed(2).replace('.', ',')}`;
  };

  // Usar dados das corridas com informações dos motoristas
  // Só exibir os cards quando não estiver carregando e tiver dados dos motoristas
  const displayRides = loadingDrivers ? [] : (ridesWithDriverData.length > 0 ? ridesWithDriverData : rides);

  return (
    <div className="min-h-screen bg-white pb-20">
        <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Resultados da Pesquisa</h1>
          <p className="text-gray-600">
            {loadingDrivers ? 'Carregando informações dos motoristas...' : `Encontramos ${displayRides.length} carona${displayRides.length !== 1 ? 's' : ''} disponível${displayRides.length !== 1 ? 'is' : ''}`}
          </p>
        </div>
        
        {loadingDrivers ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 text-base">Carregando informações dos motoristas...</p>
          </div>
        ) : displayRides.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhuma carona encontrada</p>
            <p className="text-gray-400 text-sm mt-2">Tente ajustar sua busca</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {displayRides.map((ride, index) => (
              <SearchResultCard
                key={ride.id || ride._id || index}
                departureTime={formatTime(ride.startTime)}
                arrivalTime={formatTime(ride.endTime)}
                departureLocation={ride.departureLocation || ride.departureAddress || ride.departure?.address || 'Local não informado'}
                arrivalLocation={ride.arrivalLocation || ride.destinationAddress || ride.destination?.address || 'Local não informado'}
                date={formatDate(ride.date)}
                price={formatPrice(ride.pricePerPassenger)}
                driverName={ride.driverName || `Motorista ${ride.driverId?.substring(0, 6) || 'N/A'}`}
                driverPhoto={ride.driverPhoto}
                onSelect={() => handleSelectRide(ride)}
              />
            ))}
          </div>
        )}
      </div>
      
      <BottomNav 
        activeTab="search"
        onTabChange={handleTabChange}
      />
    </div>
  );
};
