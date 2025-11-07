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
  
  // Atualizar quando initialDeparture mudar
  useEffect(() => {
    setDeparture(initialDeparture || '');
  }, [initialDeparture]);

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  const handleAddressSelect = (address: AddressResult) => {
    saveCoordinates(address); // Salva as coordenadas automaticamente
    console.log('Endereço selecionado e coordenadas salvas:', address);
    
    // Navegar automaticamente para a tela de destino
    setTimeout(() => {
      onStepChange?.('destination');
    }, 500); // Pequeno delay para mostrar o feedback
  };

  // Função para salvar as coordenadas quando um endereço é selecionado
  const saveCoordinates = (address: AddressResult) => {
    const coordinates = {
      latitude: parseFloat(address.lat),
      longitude: parseFloat(address.lon),
      address: address.display_name,
      placeId: address.place_id
    };
    
    // Salvar no localStorage ou enviar para API
    localStorage.setItem('selectedAddress', JSON.stringify(coordinates));
    console.log('Coordenadas salvas:', coordinates);
  };

  const handleContinue = () => {
    onStepChange?.('destination');
  };

  return (
    <div className="min-h-screen bg-white pb-20 flex flex-col">
      <div className="px-6 py-8 flex-1">
        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          De onde você vai sair?
        </h1>

        {/* Campo de Busca */}
        <div className="mb-8">
          <SearchInput
            placeholder="Insira o endereço completo"
            value={departure}
            onChange={setDeparture}
            onAddressSelect={handleAddressSelect}
          />
        </div>
      </div>

      {isEditing && departure && (
        <div className="px-6 mb-4">
          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
