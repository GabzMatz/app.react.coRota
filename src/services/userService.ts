import { authService } from './authService';

export interface UserRegisterRequest {
  corporateEmail: string;
  cpf: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  companyId: string;
  addressId: string;
  hasCar: boolean;
  isActive: boolean;
}

export interface UserRegisterResponse {
  id: string;
  corporateEmail: string;
  cpf: string;
  firstName: string;
  lastName: string;
  phone: string;
  companyId: string;
  addressId: string;
  hasCar: boolean;
  isActive: boolean;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface UserError {
  message: string;
  status?: number;
}

export interface MeResponse {
  id: string;
  email: string;
}

export interface UserResponse {
  corporateEmail: string;
  cpf: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  companyId: string;
  addressId: string;
  hasCar: boolean;
  isActive: boolean;
  carInfo?: string;
  id: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

class UserService {
  private baseURL = 'https://us-central1-corota-fe133.cloudfunctions.net/api';

  async registerUser(userData: UserRegisterRequest): Promise<UserRegisterResponse> {
    try {
      console.log('👤 Registrando usuário:', userData);

      const response = await fetch(`${this.baseURL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('📡 Resposta da API:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro na API:', errorData);
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const data: UserRegisterResponse = await response.json();
      console.log('✅ Usuário registrado com sucesso:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Erro ao registrar usuário:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  }

  async getMe(): Promise<MeResponse> {
    const response = await fetch(`${this.baseURL}/users/me`, {
      method: 'GET',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
    }

    const data: MeResponse = await response.json();
    return data;
  }

  async getUserById(userId: string): Promise<UserResponse> {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${this.baseURL}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
    }

    const data: UserResponse = await response.json();
    return data;
  }
}

export const userService = new UserService();
