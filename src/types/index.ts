export enum RideStatus {
  COMPLETED = "completed",
  CANCELED = "canceled",
  PENDING = "pending",
}

export interface BookedRide {
  id: string;
  rideDetails: any;
  searchData: { departure: string; passengers: number | null; date: string | null };
  bookingDate: string;
  status: 'confirmed' | 'cancelled' | RideStatus;
  role?: 'driver' | 'passenger';
  sortDate?: number;
}
