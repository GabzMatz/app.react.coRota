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
  onEditRide?: (rideId: string) => void;
  isLoading?: boolean;
  onViewRideDetails?: (ride: BookedRide) => void;
}

export const RidesList: React.FC<RidesListProps> = ({
  onTabChange,
  bookedRides = [],
  onCancelBooking,
  onEditRide,
  isLoading = false,
  onViewRideDetails
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [rideToCancel, setRideToCancel] = useState<string | null>(null);

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  const handleEdit = (rideId: string) => {
    onEditRide?.(rideId);
  };

  const handleViewDetails = (ride: BookedRide) => {
    onViewRideDetails?.(ride);
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

  const activeRides = bookedRides.sort((a, b) => {
    const dateA = a.sortDate || 0;
    const dateB = b.sortDate || 0;
    return dateB - dateA;
  });

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header />
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-base">Carregando histórico de corridas...</p>
        </div>
      ) : activeRides.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <p className="text-gray-500 text-lg">Nenhuma reserva encontrada</p>
          <p className="text-gray-400 text-sm mt-2">Faça uma busca para encontrar caronas disponíveis</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {activeRides.map((booking) => (
            <RideCard
              key={booking.id}
              departureTime={booking.rideDetails.departureTime}
              arrivalTime={booking.rideDetails.arrivalTime}
              date={booking.rideDetails.date}
              price={booking.rideDetails.price}
              driverName={booking.rideDetails.driverName}
              driverPhoto={booking.rideDetails.driverPhoto}
              status={booking.status}
              role={booking.role}
              onEdit={() => handleEdit(booking.rideDetails.id || booking.id)}
              onCancel={() => handleCancel(booking.id)}
              onClick={booking.role === 'driver' ? () => handleViewDetails(booking) : undefined}
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
