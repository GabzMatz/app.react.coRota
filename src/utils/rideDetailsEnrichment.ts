import { parseVehicleTypeFromCarInfo, type VehicleType } from './vehicleType';

export const buildPassengerRideExtras = (
  ride: {
    pickupPlanConfigured?: boolean;
    pickupMode?: 'meeting_point' | 'street_by_street';
    meetingPoint?: { street: string; city: string; state: string } | null;
    passengerPickups?: Array<{ userId: string; address: string }>;
  },
  driverData?: { vehicleType?: VehicleType; carInfo?: string } | null,
  passengerUserId?: string | null
) => {
  const pickups = Array.isArray(ride.passengerPickups) ? ride.passengerPickups : [];
  const myPickup = passengerUserId
    ? pickups.find((pickup) => pickup.userId === passengerUserId)
    : undefined;

  const driverVehicleType =
    driverData?.vehicleType || parseVehicleTypeFromCarInfo(driverData?.carInfo);

  return {
    pickupPlanConfigured: Boolean(ride.pickupPlanConfigured),
    pickupMode: ride.pickupMode || ('meeting_point' as const),
    meetingPoint: ride.meetingPoint || null,
    passengerStreetAddress: myPickup?.address || '',
    driverVehicleType,
  };
};
