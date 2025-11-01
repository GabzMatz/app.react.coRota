import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { SearchInput } from '../components/SearchInput';
import { BottomNav } from '../components/BottomNav';
import { rideService } from '../services/rideService';
import { useToast } from '../contexts/ToastContext';

interface AddressResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

interface SearchDestinationPageProps {
  onTabChange?: (tab: string) => void;
  onBack?: () => void;
  onContinue?: (rides: any[]) => void;
  searchData?: { departure: string; passengers: number };
}

export const SearchDestinationPage: React.FC<SearchDestinationPageProps> = ({ 
  onTabChange, 
  onBack, 
  onContinue,
  searchData 
}) => {
  const { showError } = useToast();
  const [destination, setDestination] = useState('');
  const [useCompanyAddress, setUseCompanyAddress] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  const handleAddressSelect = (address: AddressResult) => {
    saveDestinationCoordinates(address);
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

  const handleContinue = async () => {
    // Verificar se temos as informações necessárias
    const destinationData = localStorage.getItem('selectedDestination');
    const departureData = localStorage.getItem('selectedAddress');
    
    if (!destinationData) {
      showError('Por favor, selecione um destino ou marque "Usar endereço da empresa".');
      return;
    }

    if (!departureData) {
      showError('Erro: Endereço de partida não encontrado. Volte para a tela anterior.');
      return;
    }

    try {
      setLoading(true);
      
      const departure = JSON.parse(departureData);
      const destination = JSON.parse(destinationData);

      // Verificar se temos coordenadas válidas
      if (!departure.latitude || !departure.longitude || !destination.latitude || !destination.longitude) {
        throw new Error('Coordenadas de partida ou destino inválidas.');
      }

      // Chamar API para buscar corridas sugeridas
      const response = await rideService.suggestRides({
        departureLatLng: [Number(departure.latitude), Number(departure.longitude)] as [number, number],
        destinationLatLng: [Number(destination.latitude), Number(destination.longitude)] as [number, number]
      });

      // Passar os resultados para a próxima página
      const rides = response.data || [];
      onContinue?.(rides);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar corridas sugeridas';
      showError(message);
      console.error('Erro ao buscar corridas:', error);
    } finally {
      setLoading(false);
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
              Usar endereço da empresa?
            </span>
          </label>
        </div>
      </div>

      {/* Loading overlay quando estiver buscando */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-700 text-base font-medium">Buscando corridas disponíveis...</p>
          </div>
        </div>
      )}

      {/* Botão Continuar - Fixo na parte inferior */}
      <div className="fixed bottom-20 left-0 right-0 px-6 bg-white py-4">
        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Buscando...' : 'Continuar'}
        </button>
      </div>

      <BottomNav 
        activeTab="search"
        onTabChange={handleTabChange}
      />
    </div>
  );
};

