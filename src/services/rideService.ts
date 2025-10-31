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
    console.log('rideService.chooseRide chamado');
    console.log('rideId:', rideId);
    console.log('userId:', userId);
    
    const token = localStorage.getItem('authToken');
    console.log('token encontrado:', !!token);

    if (!token) {
      console.error('Token de autenticação não encontrado');
      throw new Error('Token de autenticação não encontrado');
    }

    const url = `${this.baseURL}/ride/${rideId}/choose/${userId}`;
    console.log('URL da requisição:', url);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Resposta recebida:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro na resposta:', errorData);
      throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
    }

    const data = await response.json().catch(() => ({}));
    console.log('Dados da resposta:', data);
    return data;
  }
}

export const rideService = new RideService();


