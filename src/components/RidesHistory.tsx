import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';

interface Ride {
  id: number;
  route: string;
  date: string;
}

interface RidesHistoryProps {
  rides?: Ride[];
}

// Dados mockados das corridas sugeridas
const defaultRides: Ride[] = [
  {
    id: 1,
    route: 'Partida → Empresa - Sede 02',
    date: 'Dia 09 de Novembro - 3 passageiros'
  },
  {
    id: 2,
    route: 'Partida → Empresa - Sede 03',
    date: 'Dia 15 de Novembro - 4 passageiros'
  },
  {
    id: 3,
    route: 'Partida → Empresa - Sede 01',
    date: 'Dia 20 de Novembro - 3 passageiros'
  }
];

export const RidesHistory: React.FC<RidesHistoryProps> = ({ rides = defaultRides }) => {
  const handleRideClick = (rideId: number) => {
    console.log('Clicou na corrida:', rideId);
    // Aqui você pode adicionar navegação ou outras ações
  };

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
