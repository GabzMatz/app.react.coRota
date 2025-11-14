import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';

interface Ride {
  id: string | number;
  route: string;
  date: string;
}

interface RidesHistoryProps {
  rides?: Ride[];
  isLoading?: boolean;
}

export const RidesHistory: React.FC<RidesHistoryProps> = ({ rides = [], isLoading = false }) => {
  const handleRideClick = (rideId: string | number) => {
    console.log('Clicou na corrida:', rideId);
  };

  if (isLoading) {
    return (
      <div className="px-4 py-8 flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-gray-600 text-sm">Carregando suas últimas corridas...</p>
      </div>
    );
  }

  if (!rides || rides.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-6">
      <div className="space-y-3">
        {rides.map((ride) => (
          <div 
            key={ride.id} 
            className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => handleRideClick(ride.id)}
          >
            <div className="flex-shrink-0 mr-4">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            
            <div className="flex-1">
              <p className="font-medium text-gray-800">{ride.route}</p>
              <p className="text-sm text-gray-600 mt-1">{ride.date}</p>
            </div>
            
            <div className="flex-shrink-0">
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
