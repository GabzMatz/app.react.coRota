import React, { useState } from 'react';
import { ArrowLeft, MapPin, Star, Users, Calendar, Clock } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { rideService } from '../services/rideService';

interface BookingPageProps {
  rideDetails: any;
  searchData?: { departure: string; passengers: number } | null;
  onTabChange?: (tab: string) => void;
  onBack?: () => void;
  onConfirmBooking?: (rideDetails: any, searchData: { departure: string; passengers: number }) => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({ rideDetails, searchData, onTabChange, onBack, onConfirmBooking }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  // Calcular preço total
  const calculateTotalPrice = () => {
    if (!searchData || !rideDetails) return rideDetails?.price || 'R$ 0';
    
    const basePrice = parseFloat(rideDetails.price.replace('R$ ', '').replace(',', '.'));
    const totalPrice = basePrice * searchData.passengers;
    
    return `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
  };

  const handleConfirmBooking = async () => {
    if (!rideDetails || !rideDetails.id) {
      setError('ID da corrida não encontrado');
      return;
    }

    // Obter ID do usuário logado
    const authUserRaw = localStorage.getItem('authUser');
    
    if (!authUserRaw) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      const authUser = JSON.parse(authUserRaw);
      const userId = authUser.id;

      if (!userId) {
        setError('ID do usuário não encontrado');
        return;
      }

      setIsLoading(true);
      setError('');

      // Fazer a requisição PUT para reservar a corrida
      await rideService.chooseRide(rideDetails.id, userId);

      // Se chegou aqui, a reserva foi bem-sucedida
      if (onConfirmBooking && searchData) {
        onConfirmBooking(rideDetails, searchData);
      }
    } catch (err) {
      console.error('Erro ao confirmar reserva:', err);
      setError(err instanceof Error ? err.message : 'Erro ao confirmar reserva');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header com botão voltar */}
      <div className="flex items-center p-3 border-b border-gray-200">
        <button 
          onClick={onBack}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Confirmar Reserva</h1>
      </div>

      <div className="px-4 py-4">
        {/* Resumo da Carona */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Detalhes da Carona</h2>
          
          {/* Data e Horário */}
          <div className="flex items-center mb-3">
            <Calendar className="w-5 h-5 text-blue-600 mr-3" />
            <span className="font-medium text-gray-900">{rideDetails.date}</span>
          </div>
          
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-blue-600 mr-3" />
            <span className="font-medium text-gray-900">{rideDetails.departureTime} - {rideDetails.arrivalTime}</span>
          </div>

          {/* Rota */}
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{rideDetails.departureLocation}</div>
                <div className="text-sm text-gray-600">{rideDetails.departureAddress}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <MapPin className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{rideDetails.arrivalLocation}</div>
                <div className="text-sm text-gray-600">{rideDetails.arrivalAddress}</div>
              </div>
            </div>
          </div>

           {/* Preço */}
           <div className="mt-4 pt-4 border-t border-gray-200">
             <div className="flex justify-between items-center mb-2">
               <span className="text-gray-900 font-medium">Preço por passageiro</span>
               <span className="text-lg font-bold text-gray-900">{rideDetails.price}</span>
             </div>
             {searchData && searchData.passengers > 1 && (
               <div className="flex justify-between items-center">
                 <span className="text-gray-600 text-sm">{searchData.passengers} passageiros</span>
                 <span className="text-sm text-gray-600">× {rideDetails.price}</span>
               </div>
             )}
             <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-300">
               <span className="text-gray-900 font-bold">Preço Total</span>
               <span className="text-xl font-bold text-blue-600">{calculateTotalPrice()}</span>
             </div>
           </div>
        </div>

        {/* Informações do Motorista */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-md font-bold text-gray-900 mb-3">Motorista</h3>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden mr-3">
              {rideDetails.driverPhoto ? (
                <img 
                  src={rideDetails.driverPhoto} 
                  alt={rideDetails.driverName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-medium text-sm">
                  {rideDetails.driverName.split(' ').map((n: string) => n[0]).join('')}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{rideDetails.driverName}</div>
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                {rideDetails.driverRating}
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-1" />
              {rideDetails.maxPassengers} lugares
            </div>
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Botão Confirmar Reserva */}
        <button 
          onClick={handleConfirmBooking}
          disabled={isLoading}
          className={`w-full py-4 rounded-lg font-medium transition-colors ${
            isLoading
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Confirmando...' : 'Confirmar Reserva'}
        </button>
      </div>

      <BottomNav 
        activeTab="search"
        onTabChange={handleTabChange}
      />
    </div>
  );
};
