export interface BookedRide {
  id: string;
  rideDetails: any;
  searchData: { departure: string; passengers: number };
  bookingDate: string;
  status: 'confirmed' | 'cancelled';
  role?: 'driver' | 'passenger';
}
