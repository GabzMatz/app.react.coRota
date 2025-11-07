export interface AddressCreateRequest {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  lat: string;
  long: string;
  complement?: string;
  isActive: boolean;
}

export interface AddressCreateResponse {
  message: string;
  data: {
    id: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    lat: string;
    long: string;
    complement?: string;
    isActive: boolean;
    createdAt: {
      _seconds: number;
      _nanoseconds: number;
    };
  };
}

export interface AddressResponse {
  id: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  lat: string;
  long: string;
  complement?: string;
  isActive: boolean;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface AddressError {
  message: string;
  status?: number;
}

class AddressService {
  private baseURL = 'https://us-central1-corota-fe133.cloudfunctions.net/api';
  
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async createAddress(addressData: AddressCreateRequest): Promise<AddressCreateResponse> {
    try {
      const response = await fetch(`${this.baseURL}/address/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const data: AddressCreateResponse = await response.json();
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  }

  async getAddressById(addressId: string): Promise<AddressResponse> {
    try {
      const response = await fetch(`${this.baseURL}/address/${addressId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const data: AddressResponse = await response.json();
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  }
}

export const addressService = new AddressService();
