export type VehicleType = 'car' | 'motorcycle';

export const vehicleTypeLabel = (type?: VehicleType | string | null): string => {
  if (type === 'motorcycle') {
    return 'Moto';
  }
  if (type === 'car') {
    return 'Carro';
  }
  return 'Veículo não informado';
};

export const parseVehicleTypeFromCarInfo = (carInfo?: string): VehicleType | undefined => {
  if (!carInfo) {
    return undefined;
  }
  const match = carInfo.match(/Tipo:\s*(Carro|Moto|Motorcycle)/i);
  if (!match?.[1]) {
    return undefined;
  }
  const value = match[1].toLowerCase();
  if (value === 'moto' || value === 'motorcycle') {
    return 'motorcycle';
  }
  return 'car';
};
