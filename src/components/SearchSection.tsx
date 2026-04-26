import React, { useState } from 'react';
import { Calendar, Users } from 'lucide-react';
import panel from '../assets/panel.png';
import { SearchInput } from './SearchInput';
import { useToast } from '../contexts/ToastContext';

interface AddressResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

interface SearchSectionProps {
  onSearch?: (searchData: { departure: string; passengers: number | null; date: string | null }) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({ onSearch }) => {
  const { showError } = useToast();
  const [departure, setDeparture] = useState('');
  const [passengers, setPassengers] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [hasSelectedAddress, setHasSelectedAddress] = useState(false);

  const incrementPassengers = () => {
    setPassengers(prev => {
      if (prev === null) return 1;
      return Math.min(4, prev + 1);
    });
  };

  const decrementPassengers = () => {
    setPassengers(prev => {
      if (prev === null) return null;
      if (prev <= 1) return null;
      return prev - 1;
    });
  };

  const handleAddressSelect = (address: AddressResult) => {
    const coordinates = {
      latitude: parseFloat(address.lat),
      longitude: parseFloat(address.lon),
      address: address.display_name,
      placeId: address.place_id
    };
    
    localStorage.setItem('selectedAddress', JSON.stringify(coordinates));
    setDeparture(address.display_name);
    setHasSelectedAddress(true);
    console.log('Coordenadas de partida salvas:', coordinates);
  };

  const handleDepartureChange = (value: string) => {
    setDeparture(value);
    if (hasSelectedAddress) {
      const storedAddress = localStorage.getItem('selectedAddress');
      if (storedAddress) {
        const parsed = JSON.parse(storedAddress);
        if (parsed.address !== value) {
          setHasSelectedAddress(false);
          localStorage.removeItem('selectedAddress');
        }
      }
    }
  };

  return (
    <div className="relative overflow-visible">
      
      <div className="relative">
        <img 
          src={panel} 
          alt="Panel" 
          className="w-full h-auto object-cover"
        />
      </div>

      
      <div className="absolute -bottom-15 left-0 right-0 z-10 px-4">
        <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 relative overflow-visible">
          
          <div className="mb-4 relative z-50">
            <SearchInput
              placeholder="Partida"
              value={departure}
              onChange={handleDepartureChange}
              onAddressSelect={handleAddressSelect}
            />
            {!hasSelectedAddress && departure && (
              <p className="text-red-500 text-xs mt-1 ml-1">
                Selecione um endereço da lista de sugestões
              </p>
            )}
          </div>

          {/* Linha com Calendário e Passageiros */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center text-blue-600 min-w-0">
              <Calendar className="w-5 h-5 mr-2" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-700 w-full"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={decrementPassengers}
                className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
              >
                <span className="text-xs">-</span>
              </button>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span className="text-sm">{passengers ?? 'Qualquer'}</span>
              </div>
              <button 
                onClick={incrementPassengers}
                className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
              >
                <span className="text-xs">+</span>
              </button>
            </div>
          </div>

          
          <button 
            onClick={() => {
              if (!departure.trim()) {
                showError('Por favor, informe um endereço de partida.');
                return;
              }

              const departureData = localStorage.getItem('selectedAddress');
              if (!departureData) {
                showError('Por favor, selecione um endereço de partida usando as sugestões que aparecem ao digitar.');
                return;
              }

              try {
                const coordinates = JSON.parse(departureData);
                if (!coordinates.latitude || !coordinates.longitude) {
                  showError('Endereço de partida inválido. Por favor, selecione um endereço da lista de sugestões.');
                  return;
                }
              } catch {
                showError('Endereço de partida inválido. Por favor, selecione um endereço da lista de sugestões.');
                return;
              }

              localStorage.setItem('searchDeparture', departure);
              if (passengers === null) {
                localStorage.removeItem('searchPassengers');
              } else {
                localStorage.setItem('searchPassengers', String(passengers));
              }
              localStorage.setItem('searchDate', selectedDate || '');
              onSearch?.({ departure, passengers, date: selectedDate || null });
            }}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              !hasSelectedAddress || !departure.trim()
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            disabled={!hasSelectedAddress || !departure.trim()}
          >
            Procurar
          </button>
        </div>
      </div>
    </div>
  );
};
