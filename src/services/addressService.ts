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

export interface AddressError {
  message: string;
  status?: number;
}

class AddressService {
  private baseURL = 'http://localhost:3000';

  // Criar novo endereço
  async createAddress(addressData: AddressCreateRequest): Promise<AddressCreateResponse> {
    try {
      console.log('🏠 Criando endereço:', addressData);

      const response = await fetch(`${this.baseURL}/address/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      console.log('📡 Resposta da API:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro na API:', errorData);
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const data: AddressCreateResponse = await response.json();
      console.log('✅ Endereço criado com sucesso:', data);
      console.log('🏠 ID do endereço:', data.data.id);
      
      return data;
    } catch (error) {
      console.error('❌ Erro ao criar endereço:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  }
}

export const addressService = new AddressService();
