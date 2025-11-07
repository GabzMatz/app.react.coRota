import React from 'react';
import { ArrowLeft, MapPin, Star, Users} from 'lucide-react';
import { BottomNav } from '../components/BottomNav';

interface RideDetails {
  id?: number | string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  departureLocation: string;
  departureAddress: string;
  departureDistance?: string;
  arrivalLocation: string;
  arrivalAddress: string;
  arrivalDistance?: string;
  price: string;
  driverName: string;
  driverRating?: string;
  driverPhoto?: string;
  maxPassengers: number;
}

interface RideDetailsPageProps {
  rideDetails: RideDetails;
  onTabChange?: (tab: string) => void;
  onBack?: () => void;
  onPageChange?: (page: string) => void;
}

export const RideDetailsPage: React.FC<RideDetailsPageProps> = ({ rideDetails, onTabChange, onBack, onPageChange }) => {
  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  const handleContinue = () => {
    console.log('Continuar com a carona');
    onPageChange?.('booking');
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
        <h1 className="text-xl font-bold text-gray-900">{rideDetails.date}</h1>
      </div>

       <div className="px-4 py-4">
        {/* Ponto de Partida */}
        <div className="mb-3">
          <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="text-2xl font-bold text-gray-900 mr-4">{rideDetails.departureTime}</div>
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="font-bold text-gray-900 mb-1">{rideDetails.departureLocation}</div>
              <div className="text-sm text-gray-600 mb-2">{rideDetails.departureAddress}</div>
              {/* Exibir distância quando disponível ou mockada */}
              {/* {rideDetails.departureDistance ? (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs">🚶</span>
                  </div>
                  {rideDetails.departureDistance}
                </div>
              ) : (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs">🚶</span>
                  </div>
                  Distância não calculada
                </div>
              )} */}
              {rideDetails.departureDistance && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs">🚶</span>
                  </div>
                  {rideDetails.departureDistance}
                </div>
              )}
            </div>
            <div className="ml-4">
              <span className="text-gray-400">›</span>
            </div>
          </div>
        </div>

         {/* Linha conectora */}
         <div className="flex justify-center mb-4">
           <div className="w-px h-6 bg-gray-300"></div>
         </div>

         {/* Ponto de Chegada */}
         <div className="mb-3">
          <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="text-2xl font-bold text-gray-900 mr-4">{rideDetails.arrivalTime}</div>
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
              <div className="font-bold text-gray-900 mb-1">{rideDetails.arrivalLocation}</div>
              <div className="text-sm text-gray-600 mb-2">{rideDetails.arrivalAddress}</div>
              {/* Exibir distância quando disponível ou mockada */}
              {/* {rideDetails.arrivalDistance ? (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-4 h-4 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs">🚶</span>
                  </div>
                  {rideDetails.arrivalDistance}
                </div>
              ) : (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-4 h-4 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs">🚶</span>
                  </div>
                  Distância não calculada
                </div>
              )} */}
              {rideDetails.arrivalDistance && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-4 h-4 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs">🚶</span>
                  </div>
                  {rideDetails.arrivalDistance}
                </div>
              )}
            </div>
            <div className="ml-4">
              <span className="text-gray-400">›</span>
            </div>
          </div>
        </div>

         {/* Separador */}
         <div className="border-t border-gray-200 my-4"></div>

         {/* Preço */}
         <div className="flex justify-between items-center mb-4">
           <span className="text-gray-900">Preço total por passageiro</span>
           <span className="text-xl font-bold text-gray-900">{rideDetails.price}</span>
         </div>

         {/* Separador */}
         <div className="border-t border-gray-200 my-4"></div>

         {/* Informações do Motorista */}
         <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
           <div className="flex items-center">
             <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden mr-4">
               {rideDetails.driverPhoto ? (
                 <img 
                   src={rideDetails.driverPhoto} 
                   alt={rideDetails.driverName}
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <span className="text-gray-600 font-medium text-lg">
                   {rideDetails.driverName.split(' ').map(n => n[0]).join('')}
                 </span>
               )}
             </div>
             <div>
               <div className="font-bold text-gray-900">{rideDetails.driverName}</div>
               {rideDetails.driverRating && (
                 <div className="flex items-center text-sm text-gray-600">
                   <Star className="w-4 h-4 text-yellow-500 mr-1" />
                   {rideDetails.driverRating}
                 </div>
               )}
             </div>
           </div>
           <div className="flex items-center">
             <span className="text-gray-400">›</span>
           </div>
         </div>

         {/* Texto de Contato (funcionalidade futura) */}
         <div className="w-full text-blue-600 font-medium py-1 mb-3">
           Contactar {rideDetails.driverName}
         </div>

         {/* Informação de Passageiros */}
         <div className="flex items-center text-gray-600 mb-4">
           <Users className="w-5 h-5 mr-2" />
           <span>{rideDetails.maxPassengers} passageiros no máximo</span>
         </div>

        {/* Botão Continuar */}
        <button 
          onClick={handleContinue}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Continuar
        </button>
      </div>

      <BottomNav 
        activeTab="search"
        onTabChange={handleTabChange}
      />
    </div>
  );
};
