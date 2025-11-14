import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { SearchInput } from '../components/SearchInput';
import { BottomNav } from '../components/BottomNav';
import { rideService } from '../services/rideService';
import { useToast } from '../contexts/ToastContext';
import { companyService } from '../services/companyService';
import { addressService } from '../services/addressService';
import { userService } from '../services/userService';

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
  onContinue
}) => {
  const { showError } = useToast();
  const [destination, setDestination] = useState('');
  const [useCompanyAddress, setUseCompanyAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCompanyAddress, setLoadingCompanyAddress] = useState(false);

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  const getAuthenticatedUserId = async (): Promise<string> => {
    const authUserRaw = localStorage.getItem('authUser');
    if (authUserRaw) {
      try {
        const authUser = JSON.parse(authUserRaw);
        if (authUser?.id) {
          return authUser.id as string;
        }
      } catch {
      }
    }

    const me = await userService.getMe();
    localStorage.setItem('authUser', JSON.stringify({ id: me.id, email: me.email }));
    return me.id;
  };

  const handleAddressSelect = (address: AddressResult) => {
    saveDestinationCoordinates(address);
  };

  const handleCompanyAddressToggle = async (checked: boolean) => {
    setUseCompanyAddress(checked);
    
    if (checked) {
      try {
        setLoadingCompanyAddress(true);
        
        const userId = await getAuthenticatedUserId();
        const user = await userService.getUserById(userId);
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

  const handleContinue = async () => {
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
      const userId = await getAuthenticatedUserId();

      if (!departure.latitude || !departure.longitude || !destination.latitude || !destination.longitude) {
        throw new Error('Coordenadas de partida ou destino inválidas.');
      }

      const response = await rideService.suggestRides({
        departureLatLng: [Number(departure.latitude), Number(departure.longitude)] as [number, number],
        destinationLatLng: [Number(destination.latitude), Number(destination.longitude)] as [number, number],
        userId
      });

      const rides = response.data || [];
      onContinue?.(rides);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar corridas sugeridas';
      showError(message);
    } finally {
      setLoading(false);
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
              Usar endereço da empresa?
            </span>
          </label>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-700 text-base font-medium">Buscando corridas disponíveis...</p>
          </div>
        </div>
      )}

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

