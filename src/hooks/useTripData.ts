import { useState, useEffect } from 'react';

interface TripLocation {
  latitude: number;
  longitude: number;
  address: string;
  placeId: string;
}

interface TripData {
  departure: TripLocation;
  destination: TripLocation;
  createdAt: string;
  id: string;
}

export const useTripData = () => {
  const [tripData, setTripData] = useState<TripData | null>(null);

  // Carregar dados da viagem do localStorage
  const loadTripData = () => {
    try {
      const savedTripData = localStorage.getItem('tripData');
      if (savedTripData) {
        const parsedData = JSON.parse(savedTripData);
        setTripData(parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error('Erro ao carregar dados da viagem:', error);
    }
    return null;
  };

  // Salvar dados da viagem
  const saveTripData = (data: TripData) => {
    try {
      localStorage.setItem('tripData', JSON.stringify(data));
      setTripData(data);
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados da viagem:', error);
      return false;
    }
  };

  // Limpar dados da viagem
  const clearTripData = () => {
    localStorage.removeItem('tripData');
    localStorage.removeItem('selectedAddress');
    localStorage.removeItem('selectedDestination');
    setTripData(null);
  };

  // Verificar se temos dados completos
  const hasCompleteTripData = () => {
    return tripData && tripData.departure && tripData.destination;
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadTripData();
  }, []);

  return {
    tripData,
    loadTripData,
    saveTripData,
    clearTripData,
    hasCompleteTripData
  };
};
