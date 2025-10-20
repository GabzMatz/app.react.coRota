import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';

interface TimeSelectionPageProps {
  onTabChange?: (tab: string) => void;
  onBack?: () => void;
  onTimeSelected?: (time: string) => void;
}

export const TimeSelectionPage: React.FC<TimeSelectionPageProps> = ({ 
  onTabChange, 
  onBack, 
  onTimeSelected 
}) => {
  const [selectedTime, setSelectedTime] = useState('06:00');

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (selectedTime) {
      onTimeSelected?.(selectedTime);
    }
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
        <h1 className="text-xl font-bold text-gray-900">A que horas você vai buscar seus passageiros?</h1>
      </div>

      {/* Seletor de horário principal */}
      <div className="px-10 py-">
        <div className="text-center mb-8">
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="bg-blue-600 text-white text-6xl font-bold mt-20 py-10 px-14 rounded-2xl mx-auto inline-block text-center border-none outline-none cursor-pointer"
            style={{
              WebkitAppearance: 'none',
              MozAppearance: 'textfield',
              backgroundImage: 'none',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right',
              backgroundSize: '0px'
            }}
          />
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
