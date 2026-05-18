import { buildPassengerRideExtras } from './rideDetailsEnrichment';
import { parseVehicleTypeFromCarInfo } from './vehicleType';

const getAddressFromCoordinates = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`);
    if (!response.ok) {
      return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }
    const data = await response.json();
    if (data.features?.length > 0) {
      const props = data.features[0].properties;
      const addressParts = [
        props.name,
        props.street,
        props.housenumber,
        props.city || props.town || props.village,
        props.state,
        props.country,
      ].filter(Boolean);
      return addressParts.length > 0 ? addressParts.join(', ') : `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  } catch {
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  }
};

const formatDate = (dateInput: unknown): string => {
  if (!dateInput) return 'Data não disponível';
  if (typeof dateInput === 'string') {
    const parsed = new Date(dateInput);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('pt-BR');
    }
    return dateInput;
  }
  if (typeof dateInput === 'object' && dateInput !== null && '_seconds' in dateInput) {
    const seconds = Number((dateInput as { _seconds: number })._seconds);
    return new Date(seconds * 1000).toLocaleDateString('pt-BR');
  }
  return 'Data não disponível';
};

const formatTime = (time?: string): string => {
  if (!time) return '--:--';
  return time.length >= 5 ? time.slice(0, 5) : time;
};

const formatPrice = (price: number | string | undefined): string => {
  if (price === undefined || price === null) return 'R$ 0,00';
  const numeric = typeof price === 'string' ? Number(price) : price;
  if (Number.isNaN(numeric)) return 'R$ 0,00';
  return `R$ ${numeric.toFixed(2).replace('.', ',')}`;
};

export const buildRideDetailsFromApi = async (ride: Record<string, unknown>) => {
  let departureAddress = 'Endereço não disponível';
  let arrivalAddress = 'Endereço não disponível';
  const departureLatLng = ride.departureLatLng as number[] | undefined;
  const destinationLatLng = ride.destinationLatLng as number[] | undefined;

  if (departureLatLng?.length === 2) {
    departureAddress = await getAddressFromCoordinates(departureLatLng[0], departureLatLng[1]);
  }
  if (destinationLatLng?.length === 2) {
    arrivalAddress = await getAddressFromCoordinates(destinationLatLng[0], destinationLatLng[1]);
  }

  const authUserRaw = localStorage.getItem('authUser');
  let passengerUserId: string | null = null;
  if (authUserRaw) {
    try {
      passengerUserId = JSON.parse(authUserRaw).id as string;
    } catch {
      passengerUserId = null;
    }
  }

  const driverData = {
    vehicleType: parseVehicleTypeFromCarInfo(
      (ride.driverCarInfo as string | undefined) ||
        String(ride.driverVehicleType || '')
    ),
    carInfo: ride.driverCarInfo as string | undefined,
  };

  return {
    id: (ride.id || ride._id) as string | number,
    date: formatDate(ride.date),
    departureTime: formatTime(ride.startTime as string | undefined),
    arrivalTime: formatTime(ride.endTime as string | undefined),
    departureLocation: departureAddress.split(',')[0] || 'Partida',
    departureAddress,
    arrivalLocation: arrivalAddress.split(',')[0] || 'Destino',
    arrivalAddress,
    price: formatPrice(ride.pricePerPassenger as number | string | undefined),
    driverName:
      (ride.driverName as string) ||
      `Motorista ${String(ride.driverId || '').substring(0, 6) || 'N/A'}`,
    driverPhone: ride.driverPhone as string | undefined,
    driverRating: '5,0',
    driverPhoto: ride.driverPhoto as string | undefined,
    maxPassengers: (ride.allSeats as number) || (ride.availableSeats as number) || 4,
    availableSeats: (ride.availableSeats as number) ?? (ride.allSeats as number) ?? 1,
    ...buildPassengerRideExtras(
      {
        pickupPlanConfigured: Boolean(ride.pickupPlanConfigured),
        pickupMode: ride.pickupMode as 'meeting_point' | 'street_by_street' | undefined,
        meetingPoint: ride.meetingPoint as { street: string; city: string; state: string } | null,
        passengerPickups: ride.passengerPickups as Array<{ userId: string; address: string }>,
      },
      driverData,
      passengerUserId
    ),
  };
};
