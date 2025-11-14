import React, { useState } from 'react';
import { SearchInput } from '../components/SearchInput';
import { BottomNav } from '../components/BottomNav';

interface AddressResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

interface SearchDeparturePageProps {
  onTabChange?: (tab: string) => void;
  onContinue?: () => void;
}

export const SearchDeparturePage: React.FC<SearchDeparturePageProps> = ({ 
  onTabChange, 
  onContinue
}) => {
  const [departure, setDeparture] = useState('');

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  const handleAddressSelect = (address: AddressResult) => {
    saveCoordinates(address);
    console.log('Endereço de partida selecionado e coordenadas salvas:', address);
    
    setTimeout(() => {
      onContinue?.();
    }, 500);
  };

  const saveCoordinates = (address: AddressResult) => {
    const coordinates = {
      latitude: parseFloat(address.lat),
      longitude: parseFloat(address.lon),
      address: address.display_name,
      placeId: address.place_id
    };
    
    localStorage.setItem('selectedAddress', JSON.stringify(coordinates));
    console.log('Coordenadas de partida salvas:', coordinates);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="px-6 py-8">
        
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          De onde você vai sair?
        </h1>

        
        <div className="mb-8">
          <SearchInput
            placeholder="Insira o endereço completo"
            value={departure}
            onChange={setDeparture}
            onAddressSelect={handleAddressSelect}
          />
        </div>
      </div>

      <BottomNav 
        activeTab="search"
        onTabChange={handleTabChange}
      />
    </div>
  );
};

