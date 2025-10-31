import React from 'react';
import { MapPin} from 'lucide-react';

interface SearchResultCardProps {
  departureTime: string;
  arrivalTime: string;
  departureLocation: string;
  arrivalLocation: string;
  date: string;
  price: string;
  driverName: string;
  driverPhoto?: string;
  onSelect: () => void;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  departureTime,
  arrivalTime,
  date,
  price,
  driverName,
  driverPhoto,
  onSelect
}) => {
  return (
    <div 
      className="bg-gray-100 rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onSelect}
    >
       {/* Header com horários e locais */}
       <div className="flex items-center justify-between mb-5">
         <div className="flex items-center space-x-3">
           <div className="text-center">
             <div className="text-lg font-bold text-gray-900 mb-0.5">{departureTime}</div>
             <div className="text-xs text-gray-500 mt-0.5">Partida</div>
           </div>
           
           <div className="flex items-center">
             <div className="w-6 h-px bg-gray-300"></div>
             <MapPin className="w-4 h-4 text-blue-600 mx-2" />
             <div className="w-6 h-px bg-gray-300"></div>
           </div>
           
           <div className="text-center">
             <div className="text-lg font-bold text-gray-900 mb-0.5">{arrivalTime}</div>
             <div className="text-xs text-gray-500 mt-0.5">Chegada</div>
           </div>
         </div>
         
         <div className="text-right">
           <div className="text-xl font-bold mb-1">{price}</div>
           <div className="text-xs text-gray-500">{date}</div>
         </div>
       </div>

      {/* Informações do motorista */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            {driverPhoto ? (
              <img 
                src={driverPhoto} 
                alt={driverName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-600 font-medium text-sm">
                {driverName.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </span>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900 mb-0.5">{driverName}</div>
            <div className="text-sm text-gray-500">Motorista</div>
          </div>
        </div>
      </div>
    </div>
  );
};
