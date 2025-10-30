export interface CreateRideRequest {
  driverId: string;
  departureLatLng: [number, number];
  destinationLatLng: [number, number];
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  allSeats: number;
  pricePerPassenger: number;
  passengerIds: string[];
}

export interface CreateRideResponse {
  message?: string;
  data?: any;
}

class RideService {
  private baseURL = 'http://localhost:3000';

  async createRide(payload: CreateRideRequest): Promise<CreateRideResponse> {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${this.baseURL}/ride`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return response.json().catch(() => ({}));
  }
}

export const rideService = new RideService();


