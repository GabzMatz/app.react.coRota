import React from 'react';
import { SearchResultCard } from '../components/SearchResultCard';
import { BottomNav } from '../components/BottomNav';

// Dados mockados dos resultados de pesquisa
const searchResults = [
  {
    id: 1,
    departureTime: '7:30',
    arrivalTime: '8:15',
    departureLocation: 'Kalunga',
    departureAddress: 'Av. Dom Aguirre, 2121 - Jardim Santa Rosália',
    departureDistance: 'A 1,3 km do ponto de encontro',
    arrivalLocation: 'Emaximovel',
    arrivalAddress: 'Praça Carlos de Campos, 80 - Centro',
    arrivalDistance: 'A 3,4 km do ponto de chegada',
    date: '15 de Novembro',
    price: 'R$ 20',
    driverName: 'Lucas Andrade',
    driverRating: '4,9',
    driverPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    maxPassengers: 4
  },
  {
    id: 2,
    departureTime: '7:45',
    arrivalTime: '8:30',
    departureLocation: 'Shopping Norte',
    departureAddress: 'Av. Paulista, 1000 - Bela Vista',
    departureDistance: 'A 0,8 km do ponto de encontro',
    arrivalLocation: 'Empresa - Sede 03',
    arrivalAddress: 'Rua das Flores, 500 - Centro',
    arrivalDistance: 'A 2,1 km do ponto de chegada',
    date: '21 de Novembro',
    price: 'R$ 30',
    driverName: 'Mariana Costa',
    driverRating: '4,7',
    maxPassengers: 3
  },
  {
    id: 3,
    departureTime: '7:00',
    arrivalTime: '7:45',
    departureLocation: 'Terminal Sul',
    departureAddress: 'Rua da Liberdade, 200 - Liberdade',
    departureDistance: 'A 1,5 km do ponto de encontro',
    arrivalLocation: 'Empresa - Sede 01',
    arrivalAddress: 'Av. Faria Lima, 1500 - Itaim Bibi',
    arrivalDistance: 'A 0,9 km do ponto de chegada',
    date: '24 de Novembro',
    price: 'R$ 25',
    driverName: 'Rafael Silva',
    driverRating: '4,8',
    driverPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    maxPassengers: 5
  },
  {
    id: 4,
    departureTime: '8:00',
    arrivalTime: '8:45',
    departureLocation: 'Metrô Centro',
    departureAddress: 'Praça da Sé, 100 - Sé',
    departureDistance: 'A 0,5 km do ponto de encontro',
    arrivalLocation: 'Empresa - Sede 02',
    arrivalAddress: 'Rua Augusta, 800 - Consolação',
    arrivalDistance: 'A 1,2 km do ponto de chegada',
    date: '18 de Novembro',
    price: 'R$ 22',
    driverName: 'Ana Santos',
    driverRating: '4,6',
    maxPassengers: 4
  },
  {
    id: 5,
    departureTime: '7:15',
    arrivalTime: '8:00',
    departureLocation: 'Terminal Oeste',
    departureAddress: 'Av. Rebouças, 300 - Pinheiros',
    departureDistance: 'A 1,1 km do ponto de encontro',
    arrivalLocation: 'Empresa - Sede 01',
    arrivalAddress: 'Av. Faria Lima, 1500 - Itaim Bibi',
    arrivalDistance: 'A 0,9 km do ponto de chegada',
    date: '22 de Novembro',
    price: 'R$ 28',
    driverName: 'Carlos Oliveira',
    driverRating: '4,9',
    maxPassengers: 3
  }
];

interface SearchResultsPageProps {
  onTabChange?: (tab: string) => void;
  onPageChange?: (page: string, rideData?: any) => void;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ onTabChange, onPageChange }) => {
  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  const handleSelectRide = (rideId: number) => {
    const selectedRide = searchResults.find(ride => ride.id === rideId);
    console.log('Selecionar carona:', rideId);
    onPageChange?.('ride-details', selectedRide);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
        <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Resultados da Pesquisa</h1>
          <p className="text-gray-600">Encontramos {searchResults.length} caronas disponíveis</p>
        </div>
        
         <div className="flex flex-col gap-4">
           {searchResults.map((ride) => (
             <SearchResultCard
               key={ride.id}
               departureTime={ride.departureTime}
               arrivalTime={ride.arrivalTime}
               departureLocation={ride.departureLocation}
               arrivalLocation={ride.arrivalLocation}
               date={ride.date}
               price={ride.price}
               driverName={ride.driverName}
               driverPhoto={ride.driverPhoto}
               onSelect={() => handleSelectRide(ride.id)}
             />
           ))}
         </div>
      </div>
      
      <BottomNav 
        activeTab="search"
        onTabChange={handleTabChange}
      />
    </div>
  );
};
