import React, { useState } from 'react';
import { Header } from '../components/Header';
import { RideCard } from '../components/RideCard';
import { BottomNav } from '../components/BottomNav';
import { ConfirmModal } from '../components/ConfirmModal';
import type { BookedRide } from '../types';

interface RidesListProps {
  onTabChange?: (tab: string) => void;
  bookedRides?: BookedRide[];
  onCancelBooking?: (bookingId: string) => void;
}

export const RidesList: React.FC<RidesListProps> = ({ onTabChange, bookedRides = [], onCancelBooking }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [rideToCancel, setRideToCancel] = useState<string | null>(null);

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  const handleEdit = (rideId: string) => {
    console.log('Editar carona:', rideId);
  };

  const handleCancel = (rideId: string) => {
    setRideToCancel(rideId);
    setShowConfirmModal(true);
  };

  const confirmCancel = () => {
    if (rideToCancel && onCancelBooking) {
      onCancelBooking(rideToCancel);
    }
    setShowConfirmModal(false);
    setRideToCancel(null);
  };

  const closeModal = () => {
    setShowConfirmModal(false);
    setRideToCancel(null);
  };

  // Filtrar apenas reservas confirmadas
  const confirmedRides = bookedRides.filter(ride => ride.status === 'confirmed');

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header />
      
      {confirmedRides.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <p className="text-gray-500 text-lg">Nenhuma reserva encontrada</p>
          <p className="text-gray-400 text-sm mt-2">Faça uma busca para encontrar caronas disponíveis</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {confirmedRides.map((booking) => (
            <RideCard
              key={booking.id}
              departureTime={booking.rideDetails.departureTime}
              arrivalTime={booking.rideDetails.arrivalTime}
              date={booking.rideDetails.date}
              price={booking.rideDetails.price}
              driverName={booking.rideDetails.driverName}
              driverPhoto={booking.rideDetails.driverPhoto}
              onEdit={() => handleEdit(booking.id)}
              onCancel={() => handleCancel(booking.id)}
            />
          ))}
        </div>
      )}
      
      
      <BottomNav 
        activeTab="routes"
        onTabChange={handleTabChange}
      />
      
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={closeModal}
        onConfirm={confirmCancel}
        title="Cancelar Carona"
        message="Tem certeza que deseja cancelar esta carona? Esta ação não pode ser desfeita."
        confirmText="Sim, Cancelar"
        cancelText="Não"
      />
    </div>
  );
};
