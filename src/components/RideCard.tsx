import React from 'react';
import { Card, CardContent } from './Card';
import { Edit, X } from 'lucide-react';
import { RideStatus } from '../types';

interface RideCardProps {
  departureTime: string;
  arrivalTime: string;
  date: string;
  price: string;
  driverName: string;
  driverPhoto?: string;
  features?: string[];
  status?: string;
  role?: 'driver' | 'passenger';
  onEdit?: () => void;
  onCancel?: () => void;
  onClick?: () => void;
}

export const RideCard: React.FC<RideCardProps> = ({
  departureTime,
  arrivalTime,
  date,
  price,
  driverName,
  driverPhoto,
  status,
  role,
  onEdit,
  onCancel,
  onClick
}) => {
  // Função para obter foto padrão quando não há foto do motorista
  const getDriverPhoto = (photo: string | undefined, name: string) => {
    if (photo && photo.trim() !== '') {
      return photo;
    }
    // Foto padrão baseada nas iniciais do nome
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=3b82f6&color=ffffff&size=56`;
  };

  // Função para obter cor e texto do status
  const getStatusConfig = (status?: string) => {
    switch (status) {
      case RideStatus.COMPLETED:
        return { color: 'text-green-500', dotColor: 'bg-green-500', label: 'Concluída' };
      case RideStatus.CANCELED:
        return { color: 'text-red-500', dotColor: 'bg-red-500', label: 'Cancelada' };
      case 'cancelled':
        return { color: 'text-red-500', dotColor: 'bg-red-500', label: 'Cancelada' };
      case RideStatus.PENDING:
        return { color: 'text-yellow-500', dotColor: 'bg-yellow-500', label: 'Pendente' };
      default:
        return { color: 'text-gray-500', dotColor: 'bg-gray-500', label: 'Pendente' };
    }
  };

  const normalizedStatus = status?.toLowerCase();
  const statusConfig = getStatusConfig(normalizedStatus);
  const isPending = normalizedStatus === RideStatus.PENDING;
  
  const handleCancelClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onCancel?.();
  };

  const handleEditClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onEdit?.();
  };

  const clickableClasses = onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : '';

  return (
    <Card className={`mx-4 p-1 ${clickableClasses}`} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Horários e linha vertical */}
          <div className="flex items-center gap-4">
            <div className="text-right text-black">
              <div className="text-xl font-semibold text-black">{departureTime}</div>
              <div className="text-base text-black">Partida</div>
            </div>
            
            {/* Linha vertical */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-0.5 h-6 bg-gray-300"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-0.5 h-6 bg-gray-300"></div>
            </div>
            
            <div className="text-left text-black">
              <div className="text-xl font-semibold text-black">{arrivalTime}</div>
              <div className="text-base text-black">Chegada</div>
            </div>
          </div>
          {/* Data e preço */}
          <div className="text-right text-black">
            <div className="text-base  text-black">{date}</div>
            <div className="text-xl font-bold text-black">{price}</div>
          </div>
          
        </div>
        
        {/* Motorista */}
        <div className="flex items-center justify-between gap-5 mt-2 mb-1">
          <div className="flex items-center gap-5">
            <img 
              src={getDriverPhoto(driverPhoto, driverName)} 
              alt={driverName}
              className="w-14 rounded-full object-cover"
              style={{ border: '2px solid #d1d5db' }}
            />
            <div className="flex flex-col gap-1">
              <div className="font-medium text-black">{driverName}</div>
              {status && (
                <div className={`flex items-center gap-1.5 ${statusConfig.color} text-xs`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`}></div>
                  <span className={statusConfig.color}>{statusConfig.label}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Botões de ação */}
          {isPending && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleCancelClick}
                className="w-10 h-10 rounded-full border transition bg-gray-200 flex items-center justify-center text-black hover:text-gray-700"
              >
                <X size={18}/>
              </button>
              {role === 'driver' && (
                <button
                  onClick={handleEditClick}
                  className="w-10 h-10 rounded-full border transition bg-gray-200 flex items-center justify-center text-black hover:text-gray-700"
                >
                  <Edit size={18} />
                </button>
              )}
            </div>
          )}
        </div>       
      </CardContent>
    </Card>
  );
};
