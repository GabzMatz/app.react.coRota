/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_BASE_URL } from '../config/api';
export interface CreateRideRequest {
  driverId: string;
  departureLatLng: [number, number];
  destinationLatLng: [number, number];
  date: string;
  startTime: string;
  endTime: string;
  allSeats: number;
  pricePerPassenger: number;
  passengerIds: string[];
  pickupMode?: 'meeting_point' | 'street_by_street';
  meetingPoint?: MeetingPoint | null;
}

export interface CreateRideResponse {
  message?: string;
  data?: any;
}

export interface SuggestRidesRequest {
  departureLatLng: [number, number];
  destinationLatLng: [number, number];
  date?: string | null;
  minimumAvailableSeats?: number;
  userId: string;
}

export interface SuggestRidesResponse {
  data?: any[];
  message?: string;
}

export interface MeetingPoint {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  long: number;
}

export interface MeetingPointSuggestion extends MeetingPoint {
  score: number;
  reason: string;
}

class RideService {
  private baseURL = API_BASE_URL;

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
    const requestBody: SuggestRidesRequest = {
      departureLatLng: payload.departureLatLng,
      destinationLatLng: payload.destinationLatLng,
      userId: payload.userId,
      ...(payload.date ? { date: payload.date } : {}),
      ...(typeof payload.minimumAvailableSeats === 'number'
        ? { minimumAvailableSeats: payload.minimumAvailableSeats }
        : {})
    };

    const request = async (body: SuggestRidesRequest) => fetch(`${this.baseURL}/ride/suggest-rides`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(body)
    });

    let response = await request(requestBody);

    // Backward compatibility: retry when backend still doesn't accept minimumAvailableSeats.
    if (!response.ok && requestBody.minimumAvailableSeats !== undefined) {
      const errorData = await response.json().catch(() => ({}));
      const validationBodyMessage = errorData?.validation?.body?.message || '';
      const shouldRetryWithoutMinimumSeats = typeof validationBodyMessage === 'string'
        && validationBodyMessage.includes('"minimumAvailableSeats" is not allowed');

      if (shouldRetryWithoutMinimumSeats) {
        const fallbackPayload: SuggestRidesRequest = {
          departureLatLng: requestBody.departureLatLng,
          destinationLatLng: requestBody.destinationLatLng,
          userId: requestBody.userId,
          ...(requestBody.date ? { date: requestBody.date } : {})
        };
        response = await request(fallbackPayload);
      } else {
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return response.json().catch(() => ({}));
  }

  async chooseRide(rideId: string | number, userId: string, seatsRequested = 1): Promise<any> {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const pickupRaw = localStorage.getItem('selectedAddress');
    let pickupAddress = '';
    let pickupLatLng: [number, number] | undefined;
    if (pickupRaw) {
      try {
        const parsed = JSON.parse(pickupRaw);
        pickupAddress = typeof parsed?.address === 'string' ? parsed.address : '';
        const lat = Number(parsed?.latitude);
        const lng = Number(parsed?.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          pickupLatLng = [lat, lng];
        }
      } catch {
        // noop
      }
    }

    const chooseOnce = async (requestedSeats?: number) => {
      const bodyPayload = {
        ...(typeof requestedSeats === 'number' ? { seatsRequested: requestedSeats } : {}),
        ...(pickupAddress ? { pickupAddress } : {}),
        ...(pickupLatLng ? { pickupLatLng } : {})
      };
      const response = await fetch(`${this.baseURL}/ride/${rideId}/choose/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      return response.json().catch(() => ({}));
    };

    const countUserReservedSeats = (rideData: any): number => {
      if (!Array.isArray(rideData?.passengerIds)) {
        return 0;
      }
      return rideData.passengerIds.filter((id: string) => id === userId).length;
    };

    try {
      if (seatsRequested <= 1) {
        return await chooseOnce(1);
      }

      const rideBefore = await this.getRideById(rideId);
      const reservedBefore = countUserReservedSeats(rideBefore);

      await chooseOnce(seatsRequested);

      const rideAfter = await this.getRideById(rideId);
      const reservedAfter = countUserReservedSeats(rideAfter);
      const reservedDelta = Math.max(0, reservedAfter - reservedBefore);

      if (reservedDelta < seatsRequested) {
        const remainingSeats = seatsRequested - reservedDelta;
        for (let i = 0; i < remainingSeats; i += 1) {
          await chooseOnce();
        }
      }

      return {};
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const seatFieldRejected = message.includes('seatsRequested');

      if (!seatFieldRejected) {
        throw error;
      }

      // Backend antigo: reservamos assento por assento apenas nesse caso.
      for (let i = 0; i < seatsRequested; i += 1) {
        await chooseOnce();
      }
      return {};
    }
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

  async updatePickupPlan(
    rideId: string | number,
    payload: { pickupMode: 'meeting_point' | 'street_by_street'; meetingPoint?: MeetingPoint | null }
  ): Promise<any> {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const response = await fetch(`${this.baseURL}/ride/${rideId}/pickup-plan`, {
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

  async suggestMeetingPoints(rideId: string | number): Promise<MeetingPointSuggestion[]> {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const response = await fetch(`${this.baseURL}/ride/${rideId}/meeting-point-suggestions`, {
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

    const payload = await response.json().catch(() => ({}));
    return Array.isArray(payload?.data) ? payload.data : [];
  }

  async getPickupContext(rideId: string | number): Promise<{
    ride: any;
    passengerPickups: Array<{ userId: string; address: string; lat: number; long: number }>;
  }> {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const response = await fetch(`${this.baseURL}/ride/${rideId}/pickup-context`, {
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

    const payload = await response.json().catch(() => ({}));
    return payload?.data || { ride: null, passengerPickups: [] };
  }
}

export const rideService = new RideService();


