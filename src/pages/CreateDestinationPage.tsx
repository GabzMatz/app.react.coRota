import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { SearchInput } from '../components/SearchInput';
import { BottomNav } from '../components/BottomNav';
import { useTripData } from '../hooks/useTripData';

interface AddressResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

interface CreateDestinationPageProps {
  onTabChange?: (tab: string) => void;
  onBack?: () => void;
  onStepChange?: (step: 'departure' | 'destination' | 'route') => void;
}

export const CreateDestinationPage: React.FC<CreateDestinationPageProps> = ({ onTabChange, onBack, onStepChange }) => {
  const [destination, setDestination] = useState('');
  const [useCompanyAddress, setUseCompanyAddress] = useState(false);
  const { saveTripData } = useTripData();

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  const handleAddressSelect = (address: AddressResult) => {
    saveDestinationCoordinates(address); // Salva as coordenadas do destino automaticamente
    console.log('Destino selecionado e coordenadas salvas:', address);
  };

  const handleCompanyAddressToggle = (checked: boolean) => {
    setUseCompanyAddress(checked);
    
    if (checked) {
      // Salvar endereço da empresa como destino
      const companyAddress = {
        latitude: -23.5505, // Exemplo: coordenadas de São Paulo
        longitude: -46.6333,
        address: "Endereço da Empresa",
        placeId: "company_address"
      };
      
      localStorage.setItem('selectedDestination', JSON.stringify(companyAddress));
      console.log('Endereço da empresa selecionado:', companyAddress);
    }
  };

  const handleContinue = () => {
    // Verificar se temos as informações necessárias
    const departureData = localStorage.getItem('selectedAddress');
    const destinationData = localStorage.getItem('selectedDestination');
    
    if (!departureData) {
      alert('Erro: Endereço de partida não encontrado. Volte para a tela anterior.');
      return;
    }
    
    if (!destinationData) {
      alert('Por favor, selecione um destino ou marque "Usar endereço da empresa".');
      return;
    }

    // Salvar informações completas da viagem
    const tripData = {
      departure: JSON.parse(departureData),
      destination: JSON.parse(destinationData),
      createdAt: new Date().toISOString(),
      id: Date.now().toString()
    };

    // Salvar usando o hook
    const success = saveTripData(tripData);
    
    if (success) {
      console.log('Informações da viagem salvas com sucesso:', tripData);
      console.log('Partida:', tripData.departure);
      console.log('Destino:', tripData.destination);
      
      // Navegar para a tela de rota selecionada
      setTimeout(() => {
        onStepChange?.('route');
      }, 500);
    } else {
      alert('Erro ao salvar as informações da viagem. Tente novamente.');
    }
  };

  // Função para salvar as coordenadas do destino quando selecionado
  const saveDestinationCoordinates = (address: AddressResult) => {
    const coordinates = {
      latitude: parseFloat(address.lat),
      longitude: parseFloat(address.lon),
      address: address.display_name,
      placeId: address.place_id
    };
    
    // Salvar no localStorage
    localStorage.setItem('selectedDestination', JSON.stringify(coordinates));
    console.log('Coordenadas do destino salvas:', coordinates);
  };

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
        <h1 className="text-xl font-bold text-gray-900">Para onde você vai?</h1>
      </div>
      
      <div className="px-6 py-8">
        {/* Campo de Busca */}
        <div className="mb-6">
          <SearchInput
            placeholder="Insira o endereço completo"
            value={destination}
            onChange={setDestination}
            onAddressSelect={handleAddressSelect}
            showSuggestions={!useCompanyAddress}
            disabled={useCompanyAddress}
          />
        </div>

        {/* Checkbox para usar endereço da empresa */}
        <div className="mb-8">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useCompanyAddress}
              onChange={(e) => handleCompanyAddressToggle(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="ml-3 text-sm font-medium text-gray-700">
              Usar endereço da empresa
            </span>
          </label>
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
