/* eslint-disable @typescript-eslint/no-explicit-any */
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

export interface SuggestRidesRequest {
  departureLatLng: [number, number];
  destinationLatLng: [number, number];
}

export interface SuggestRidesResponse {
  data?: any[];
  message?: string;
}

class RideService {
  private baseURL = 'https://us-central1-corota-fe133.cloudfunctions.net/api';

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

  async suggestRides(payload: SuggestRidesRequest): Promise<SuggestRidesResponse> {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${this.baseURL}/ride/suggest-rides`, {
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

  async chooseRide(rideId: string | number, userId: string): Promise<any> {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const response = await fetch(`${this.baseURL}/ride/${rideId}/choose/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return response.json().catch(() => ({}));
  }

  async getRideHistory(userId: string): Promise<any[]> {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const response = await fetch(`${this.baseURL}/ride-history/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return response.json().catch(() => []);
  }

  async cancelAsDriver(rideId: string | number, userId: string): Promise<any> {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const response = await fetch(`${this.baseURL}/ride/${rideId}/calcel-driver/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return response.json().catch(() => ({}));
  }

  async cancelAsPassenger(rideId: string | number, userId: string): Promise<any> {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const response = await fetch(`${this.baseURL}/ride/${rideId}/calcel-passenger/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return response.json().catch(() => ({}));
  }

  async getRideById(rideId: string | number): Promise<any> {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const response = await fetch(`${this.baseURL}/ride/${rideId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return response.json().catch(() => ({}));
  }

  async updateRide(rideId: string | number, payload: CreateRideRequest): Promise<any> {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const response = await fetch(`${this.baseURL}/ride/${rideId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
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


