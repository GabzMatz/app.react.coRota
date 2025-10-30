import React, { useState } from 'react';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';

interface PassengerSelectionPageProps {
  onTabChange?: (tab: string) => void;
  onBack?: () => void;
  onPassengerSelected?: (count: number) => void;
}

export const PassengerSelectionPage: React.FC<PassengerSelectionPageProps> = ({ 
  onTabChange, 
  onBack, 
  onPassengerSelected 
}) => {
  const [passengerCount, setPassengerCount] = useState(2);

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  const handleIncrement = () => {
    if (passengerCount < 4) {
      setPassengerCount(passengerCount + 1);
    }
  };

  const handleDecrement = () => {
    if (passengerCount > 1) {
      setPassengerCount(passengerCount - 1);
    }
  };

  const handleContinue = () => {
    onPassengerSelected?.(passengerCount);
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
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quantos passageiros, você poderá levar no carro?</h1>
        </div>
      </div>

      {/* Contador de passageiros */}
      <div className="flex items-center justify-center py-12">
        <button
          onClick={handleDecrement}
          disabled={passengerCount <= 1}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center transition-colors
            ${passengerCount <= 1 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          <Minus className="w-6 h-6" />
        </button>

        <div className="mx-8">
          <span className="text-8xl font-bold text-gray-900">{passengerCount}</span>
        </div>

         <button
           onClick={handleIncrement}
           disabled={passengerCount >= 4}
           className={`
             w-12 h-12 rounded-full flex items-center justify-center transition-colors
             ${passengerCount >= 4 
               ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
               : 'bg-blue-600 text-white hover:bg-blue-700'
             }
           `}
         >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Linha separadora */}
      <div className="px-6">
        <div className="border-t border-gray-200"></div>
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
