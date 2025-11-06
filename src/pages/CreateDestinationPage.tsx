import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft } from 'lucide-react';
import { SearchInput } from '../components/SearchInput';
import { BottomNav } from '../components/BottomNav';
import { useTripData } from '../hooks/useTripData';
import { companyService } from '../services/companyService';
import { addressService } from '../services/addressService';
import { userService } from '../services/userService';

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
  initialDestination?: string;
}

export const CreateDestinationPage: React.FC<CreateDestinationPageProps> = ({ onTabChange, onBack, onStepChange, initialDestination }) => {
  const { showError } = useToast();
  const [destination, setDestination] = useState(initialDestination || '');
  const [useCompanyAddress, setUseCompanyAddress] = useState(false);
  const [loadingCompanyAddress, setLoadingCompanyAddress] = useState(false);
  const { saveTripData } = useTripData();

  useEffect(() => {
    if (initialDestination) {
      setDestination(initialDestination);
    }
  }, [initialDestination]);

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  const handleAddressSelect = (address: AddressResult) => {
    saveDestinationCoordinates(address);
  };

  const handleCompanyAddressToggle = async (checked: boolean) => {
    setUseCompanyAddress(checked);
    
    if (checked) {
      try {
        setLoadingCompanyAddress(true);
        
        const authUserRaw = localStorage.getItem('authUser');
        if (!authUserRaw) {
          throw new Error('Usuário não autenticado');
        }
        
        const authUser = JSON.parse(authUserRaw);
        if (!authUser.id) {
          throw new Error('ID do usuário não encontrado');
        }
        
        const user = await userService.getUserById(authUser.id);
        if (!user.companyId) {
          throw new Error('Empresa não encontrada no perfil do usuário');
        }
        
        const company = await companyService.getCompanyById(user.companyId);
        
        if (!company.addressId) {
          throw new Error('Endereço da empresa não encontrado');
        }
        
        const address = await addressService.getAddressById(company.addressId);
        
        const fullAddress = `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}, ${address.neighborhood}, ${address.city} - ${address.state}, ${address.zipCode}`;
        
        const companyAddress = {
          latitude: parseFloat(address.lat),
          longitude: parseFloat(address.long),
          address: fullAddress,
          placeId: `company_address_${address.id}`
        };
        
        setDestination(fullAddress);
        localStorage.setItem('selectedDestination', JSON.stringify(companyAddress));
      } catch (error) {
        setUseCompanyAddress(false);
        const message = error instanceof Error ? error.message : 'Erro ao buscar endereço da empresa';
        showError(message);
      } finally {
        setLoadingCompanyAddress(false);
      }
    } else {
      setDestination('');
      localStorage.removeItem('selectedDestination');
    }
  };

  const handleContinue = () => {
    const departureData = localStorage.getItem('selectedAddress');
    const destinationData = localStorage.getItem('selectedDestination');
    
    if (!departureData) {
      showError('Erro: Endereço de partida não encontrado. Volte para a tela anterior.');
      return;
    }
    
    if (!destinationData) {
      showError('Por favor, selecione um destino ou marque "Usar endereço da empresa".');
      return;
    }

    const tripData = {
      departure: JSON.parse(departureData),
      destination: JSON.parse(destinationData),
      createdAt: new Date().toISOString(),
      id: Date.now().toString()
    };

    const success = saveTripData(tripData);
    
    if (success) {
      setTimeout(() => {
        onStepChange?.('route');
      }, 500);
    } else {
      showError('Erro ao salvar as informações da viagem. Tente novamente.');
    }
  };

  const saveDestinationCoordinates = (address: AddressResult) => {
    const coordinates = {
      latitude: parseFloat(address.lat),
      longitude: parseFloat(address.lon),
      address: address.display_name,
      placeId: address.place_id
    };
    
    localStorage.setItem('selectedDestination', JSON.stringify(coordinates));
  };

  return (
    <div className="min-h-screen bg-white pb-20">
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
        <div className="mb-6">
          <SearchInput
            placeholder="Insira o endereço completo"
            value={destination}
            onChange={setDestination}
            onAddressSelect={handleAddressSelect}
            showSuggestions={!useCompanyAddress}
            disabled={useCompanyAddress || loadingCompanyAddress}
          />
          {loadingCompanyAddress && (
            <p className="mt-2 text-sm text-gray-500">Buscando endereço da empresa...</p>
          )}
        </div>

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
