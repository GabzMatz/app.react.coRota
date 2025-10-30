import React, { useState } from 'react';
import { Calendar, Users, MapPin } from 'lucide-react';
import panel from '../assets/panel.png';

interface SearchSectionProps {
  onSearch?: (searchData: { departure: string; passengers: number }) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({ onSearch }) => {
  const [departure, setDeparture] = useState('');
  const [passengers, setPassengers] = useState(1);

  const incrementPassengers = () => {
    setPassengers(prev => Math.min(4, prev + 1));
  };

  const decrementPassengers = () => {
    setPassengers(prev => Math.max(1, prev - 1));
  };

  return (
    <div className="relative">
      {/* Imagem Panel */}
      <div className="relative">
        <img 
          src={panel} 
          alt="Panel" 
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Card de Pesquisa Sobreposto */}
      <div className="absolute -bottom-15 left-0 right-0 z-10 px-4">
        <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
          {/* Campo de Partida */}
          <div className="mb-4">
            <div className="flex items-center border border-blue-300 rounded-lg p-3">
              <MapPin className="w-5 h-5 text-blue-600 mr-3" />
              <input
                type="text"
                placeholder="Partida"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                className="flex-1 outline-none text-gray-700"
              />
            </div>
          </div>

          {/* Linha com Calendário e Passageiros */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-blue-600">
              <Calendar className="w-5 h-5 mr-2" />
              <span className="font-medium">Calendário</span>
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
                <span className="text-sm">{passengers}</span>
              </div>
              <button 
                onClick={incrementPassengers}
                className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
              >
                <span className="text-xs">+</span>
              </button>
            </div>
          </div>

          {/* Botão Procurar */}
          <button 
            onClick={() => onSearch?.({ departure, passengers })}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Procurar
          </button>
        </div>
      </div>
    </div>
  );
};
