import React, { useState, useEffect } from 'react';
import { SearchInput } from '../components/SearchInput';
import { BottomNav } from '../components/BottomNav';

interface AddressResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

interface CreatePageProps {
  onTabChange?: (tab: string) => void;
  onStepChange?: (step: 'departure' | 'destination') => void;
  initialDeparture?: string;
  isEditing?: boolean;
}

export const CreatePage: React.FC<CreatePageProps> = ({ onTabChange, onStepChange, initialDeparture, isEditing = false }) => {
  const [departure, setDeparture] = useState(initialDeparture || '');
  
  useEffect(() => {
    setDeparture(initialDeparture || '');
  }, [initialDeparture]);

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  const isContinueDisabled = !departure.trim();

  const handleAddressSelect = (address: AddressResult) => {
    saveCoordinates(address);
    console.log('Endereço selecionado e coordenadas salvas:', address);
    
    setTimeout(() => {
      onStepChange?.('destination');
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
    console.log('Coordenadas salvas:', coordinates);
  };

  const handleContinue = () => {
    if (isContinueDisabled) {
      return;
    }

    onStepChange?.('destination');
  };

  return (
    <div className="min-h-screen bg-white pb-20 flex flex-col">
      <div className="px-6 py-8 flex-1">
        
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

      {isEditing && (
        <div className="px-6 mb-4">
          <button
            onClick={handleContinue}
            disabled={isContinueDisabled}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar
          </button>
        </div>
      )}

      <BottomNav 
        activeTab="create"
        onTabChange={handleTabChange}
      />
    </div>
  );
};
