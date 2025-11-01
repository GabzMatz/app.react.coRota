import React from 'react';
import { BottomNav } from '../components/BottomNav';
import { SearchSection } from '../components/SearchSection';
import { RidesHistory } from '../components/RidesHistory';
import type { BookedRide } from '../types';

interface SearchPageProps {
  onTabChange?: (tab: string) => void;
  onPageChange?: (page: string, data?: any) => void;
  completedRides?: BookedRide[];
}

export const SearchPage: React.FC<SearchPageProps> = ({ onTabChange, onPageChange, completedRides = [] }) => {
  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  const handleSearch = (data: { departure: string; passengers: number }) => {
    onPageChange?.('search-destination', data);
  };

  // Transformar BookedRide[] para o formato esperado pelo RidesHistory
  const formattedRides = completedRides.map((ride) => {
    // Truncar endereços se muito longos
    const truncateAddress = (address: string, maxLength: number = 30) => {
      if (!address) return '';
      if (address.length <= maxLength) return address;
      return address.substring(0, maxLength) + '...';
    };

    const departure = truncateAddress(ride.rideDetails.departureAddress || 'Origem', 25);
    const destination = truncateAddress(ride.rideDetails.arrivalAddress || 'Destino', 25);
    const route = `${departure} → ${destination}`;
    
    // Formatar data: "Dia XX de Mês - X passageiros"
    const formattedDate = ride.rideDetails.date || '';
    const passengers = ride.rideDetails.maxPassengers - ride.rideDetails.availableSeats;
    const date = `${formattedDate}${passengers > 0 ? ` - ${passengers} ${passengers === 1 ? 'passageiro' : 'passageiros'}` : ''}`;
    
    return {
      id: ride.id,
      route,
      date
    };
  });

  return (
    <div className="min-h-screen bg-white pb-20 overflow-x-hidden">
      <div className="overflow-visible">
        <SearchSection onSearch={handleSearch} />
      </div>
      <div className="pt-16">
        <RidesHistory rides={formattedRides} />
      </div>
      
      <BottomNav 
        activeTab="search"
        onTabChange={handleTabChange}
      />
    </div>
  );
};
