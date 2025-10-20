import React, { useState } from 'react';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';

interface PriceSelectionPageProps {
  onTabChange?: (tab: string) => void;
  onBack?: () => void;
  onPriceSelected?: (price: number) => void;
}

export const PriceSelectionPage: React.FC<PriceSelectionPageProps> = ({ 
  onTabChange, 
  onBack, 
  onPriceSelected 
}) => {
  const [price, setPrice] = useState(20);

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  const handleIncrement = () => {
    if (price < 100) {
      setPrice(price + 5);
    }
  };

  const handleDecrement = () => {
    if (price > 5) {
      setPrice(price - 5);
    }
  };

  const handleOfferRide = () => {
    onPriceSelected?.(price);
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
        <h1 className="text-xl font-bold text-gray-900">Defina o preço da carona</h1>
      </div>

      {/* Seletor de preço */}
      <div className="flex items-center justify-center mt-15 py-20">
        <button
          onClick={handleDecrement}
          disabled={price <= 5}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center transition-colors mr-4
            ${price <= 5 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          <Minus className="w-6 h-6" />
        </button>

        <div className="flex items-baseline">
          <span className="text-7xl font-bold text-gray-900">R$</span>
          <span className="text-7xl font-bold text-gray-900 ml-2">{price}</span>
        </div>

        <button
          onClick={handleIncrement}
          disabled={price >= 100}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center transition-colors ml-4
            ${price >= 100 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Botão Oferecer Carona - Fixo na parte inferior */}
      <div className="fixed bottom-20 left-0 right-0 px-6 bg-white py-4">
        <button
          onClick={handleOfferRide}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Oferecer carona
        </button>
      </div>

      <BottomNav 
        activeTab="create"
        onTabChange={handleTabChange}
      />
    </div>
  );
};
