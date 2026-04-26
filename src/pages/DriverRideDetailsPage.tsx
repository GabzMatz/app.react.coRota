import React, { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Users, Phone } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import type { BookedRide } from '../types';
import { getInitials } from '../utils/avatar';

export interface DriverPassengerInfo {
  id: string;
  fullName: string;
  phone: string;
  pickupAddress?: string;
  photoUrl?: string | null;
}

interface DriverRideDetailsPageProps {
  rideDetails: BookedRide['rideDetails'];
  passengers: DriverPassengerInfo[];
  isLoadingPassengers: boolean;
  onBack: () => void;
  onTabChange?: (tab: string) => void;
  onOpenPickupPlanner?: (rideId: string) => void;
}

export const DriverRideDetailsPage: React.FC<DriverRideDetailsPageProps> = ({
  rideDetails,
  passengers,
  isLoadingPassengers,
  onBack,
  onTabChange,
  onOpenPickupPlanner
}) => {
  const [isPassengerModalOpen, setIsPassengerModalOpen] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState<DriverPassengerInfo | null>(null);

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
  };

  const formatPickupAddress = (pickupAddress?: string) => {
    if (!pickupAddress || !pickupAddress.trim()) {
      return 'Endereço não disponível';
    }
    return pickupAddress;
  };

  const formatPhone = (phone?: string) => {
    if (!phone) {
      return 'Telefone não informado';
    }

    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  const ridePassengersCount = passengers.length;
  const occupiedSeats = rideDetails?.maxPassengers != null && rideDetails?.availableSeats != null
    ? Math.max(0, rideDetails.maxPassengers - rideDetails.availableSeats)
    : ridePassengersCount;

  const handlePassengerClick = async (passenger: DriverPassengerInfo) => {
    setSelectedPassenger(passenger);
    setIsPassengerModalOpen(true);
  };

  const closePassengerModal = () => {
    setIsPassengerModalOpen(false);
    setSelectedPassenger(null);
  };

  useEffect(() => {
    setIsPassengerModalOpen(false);
    setSelectedPassenger(null);
  }, [rideDetails]);

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="flex items-center p-3 border-b border-gray-200">
        <button
          onClick={onBack}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{rideDetails?.date || 'Detalhes da corrida'}</h1>
      </div>

      <div className="px-4 py-4">
        <section className="mb-3">
          <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="text-2xl font-bold text-gray-900 mr-4">{rideDetails?.departureTime}</div>
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="font-bold text-gray-900 mb-1">{rideDetails?.departureLocation}</div>
              <div className="text-sm text-gray-600 mb-2">{rideDetails?.departureAddress}</div>
              {rideDetails?.departureDistance && (
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
        </section>

        <div className="flex justify-center mb-4">
          <div className="w-px h-6 bg-gray-300"></div>
        </div>

        <section className="mb-3">
          <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="text-2xl font-bold text-gray-900 mr-4">{rideDetails?.arrivalTime}</div>
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
              <div className="font-bold text-gray-900 mb-1">{rideDetails?.arrivalLocation}</div>
              <div className="text-sm text-gray-600 mb-2">{rideDetails?.arrivalAddress}</div>
              {rideDetails?.arrivalDistance && (
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
        </section>

        <div className="border-t border-gray-200 my-4"></div>

        <section className="flex justify-between items-center mb-4">
          <div>
            <span className="text-gray-900 block">Preço total por passageiro</span>
            <span className="text-sm text-gray-500">Ocupadas: {occupiedSeats} • Vagas livres: {rideDetails?.availableSeats ?? 'N/I'}</span>
          </div>
          <span className="text-xl font-bold text-gray-900">{rideDetails?.price}</span>
        </section>

        <div className="border-t border-gray-200 my-4"></div>

        <section className="mb-4 rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Plano de embarque</h2>
          <p className="text-sm text-gray-600 mb-3">
            Defina no mapa se sera ponto de encontro unico ou passagem nas ruas dos passageiros.
          </p>
          <button
            onClick={() => rideDetails?.id && onOpenPickupPlanner?.(String(rideDetails.id))}
            className="w-full rounded-lg bg-blue-600 text-white py-2 px-3 text-sm font-medium hover:bg-blue-700"
          >
            Abrir planejamento no mapa
          </button>
        </section>

        <div className="border-t border-gray-200 my-4"></div>

        <section className="mb-4">
          <div className="flex items-center text-gray-600 mb-2">
            <Users className="w-5 h-5 mr-2" />
            <span>{rideDetails?.maxPassengers ?? '--'} passageiros no máximo</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Passageiros ({ridePassengersCount})</h2>

          {isLoadingPassengers ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-gray-500 text-sm">Carregando passageiros...</p>
            </div>
          ) : ridePassengersCount === 0 ? (
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
              Nenhum passageiro confirmado até o momento.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {passengers.map((passenger) => (
                <button
                  key={passenger.id}
                  onClick={() => handlePassengerClick(passenger)}
                  className="flex items-center justify-between w-full bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold">
                      {passenger.photoUrl ? (
                        <img src={passenger.photoUrl} alt={passenger.fullName} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        getInitials(passenger.fullName)
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{passenger.fullName}</span>
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Phone size={14} />
                        {formatPhone(passenger.phone)}
                      </span>
                    </div>
                  </div>
                  <span className="text-gray-400 text-xl leading-none">›</span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomNav
        activeTab="routes"
        onTabChange={handleTabChange}
      />

      {isPassengerModalOpen && selectedPassenger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={closePassengerModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-semibold">
                {selectedPassenger.photoUrl ? (
                  <img src={selectedPassenger.photoUrl} alt={selectedPassenger.fullName} className="w-full h-full object-cover rounded-full" />
                ) : (
                  getInitials(selectedPassenger.fullName)
                )}
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900">{selectedPassenger.fullName}</h3>
                <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
                  <Phone size={16} />
                  {formatPhone(selectedPassenger.phone)}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Endereço</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {formatPickupAddress(selectedPassenger.pickupAddress)}
              </p>
            </div>

            {selectedPassenger.phone && (
              <a
                href={`tel:${selectedPassenger.phone}`}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                <Phone size={18} />
                Ligar para passageiro
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

