import { authService } from './authService';
import { API_BASE_URL } from '../config/api';

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
  carInfo?: string;
  carSeats?: number;
  vehicleType?: 'car' | 'motorcycle';
  photo?: string;
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
  carSeats?: number;
  vehicleType?: 'car' | 'motorcycle';
  photo?: string;
  id: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

class UserService {
  private baseURL = API_BASE_URL;

  private isLegacyUserValidationError(errorData: unknown): boolean {
    const message = (errorData as { message?: unknown })?.message;
    const validationMessage = (errorData as { validation?: { body?: { message?: unknown } } })?.validation?.body?.message;
    const validationKeys = (errorData as { validation?: { body?: { keys?: unknown } } })?.validation?.body?.keys;
    const keys = Array.isArray(validationKeys) ? validationKeys : [];
    const hasCorporateEmailKey = keys.includes('corporateEmail');

    return (
      (typeof message === 'string' && message.includes('Validation failed')) &&
      (
        hasCorporateEmailKey ||
        (typeof validationMessage === 'string' && validationMessage.includes('"corporateEmail" is required'))
      )
    );
  }

  private isEmptyCarInfoValidationError(errorData: unknown): boolean {
    const validationMessage = (errorData as { validation?: { body?: { message?: unknown } } })?.validation?.body?.message;
    return typeof validationMessage === 'string' && validationMessage.includes('"carInfo" is not allowed to be empty');
  }

  private isPhotoNotAllowedValidationError(errorData: unknown): boolean {
    const validationMessage = (errorData as { validation?: { body?: { message?: unknown } } })?.validation?.body?.message;
    return typeof validationMessage === 'string' && validationMessage.includes('"photo" is not allowed');
  }

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

  async updateProfile(
    userId: string,
    payload: Partial<Pick<UserResponse, 'phone' | 'photo' | 'carInfo' | 'carSeats' | 'vehicleType'>> & {
      clearVehicle?: boolean;
    }
  ): Promise<{ message: string; photoSkipped?: boolean }> {
    const token = localStorage.getItem('authToken');
    let photoSkipped = false;
    const normalizedPayload: Record<string, unknown> = {
      ...(typeof payload.phone === 'string' ? { phone: payload.phone } : {}),
      ...(typeof payload.photo === 'string' ? { photo: payload.photo } : {}),
      ...(typeof payload.carInfo === 'string' ? { carInfo: payload.carInfo } : {}),
      ...(typeof payload.carSeats === 'number' ? { carSeats: payload.carSeats } : {}),
      ...(payload.vehicleType ? { vehicleType: payload.vehicleType } : {}),
      ...(payload.clearVehicle === true ? { clearVehicle: true } : {}),
    };

    const sendUpdate = async (body: unknown) => {
      const response = await fetch(`${this.baseURL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(body)
      });
      return response;
    };

    let response = await sendUpdate(normalizedPayload);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (this.isPhotoNotAllowedValidationError(errorData) && typeof normalizedPayload.photo === 'string') {
        const retryPayload = { ...normalizedPayload };
        delete retryPayload.photo;
        response = await sendUpdate(retryPayload);
        photoSkipped = true;
      } else if (this.isEmptyCarInfoValidationError(errorData) && normalizedPayload.carInfo === '') {
        const retryPayload = { ...normalizedPayload };
        delete retryPayload.carInfo;
        delete retryPayload.carSeats;
        response = await sendUpdate(retryPayload);
      } else if (this.isLegacyUserValidationError(errorData)) {
        const currentUser = await this.getUserById(userId);
        const mergedCarInfo = payload.carInfo ?? currentUser.carInfo ?? '';
        const mergedCarSeats = payload.carSeats ?? currentUser.carSeats;
        const hasCar = Boolean(mergedCarInfo && mergedCarInfo.trim().length > 0);

        const legacyPayload = {
          corporateEmail: currentUser.corporateEmail,
          cpf: currentUser.cpf,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          phone: payload.phone ?? currentUser.phone,
          companyId: currentUser.companyId,
          addressId: currentUser.addressId,
          hasCar,
          ...(mergedCarInfo.trim().length > 0 ? { carInfo: mergedCarInfo } : {}),
          ...(typeof mergedCarSeats === 'number' ? { carSeats: mergedCarSeats } : {}),
          ...(typeof payload.photo === 'string' ? { photo: payload.photo } : {})
        };

        response = await sendUpdate(legacyPayload);

        if (!response.ok) {
          const legacyErrorData = await response.json().catch(() => ({}));
          if (this.isPhotoNotAllowedValidationError(legacyErrorData) && 'photo' in legacyPayload) {
            const legacyPayloadWithoutPhoto = { ...legacyPayload };
            delete legacyPayloadWithoutPhoto.photo;
            response = await sendUpdate(legacyPayloadWithoutPhoto);
            photoSkipped = true;
          } else {
            throw new Error((legacyErrorData as { message?: string }).message || `Erro ${response.status}: ${response.statusText}`);
          }
        }
      } else {
        throw new Error((errorData as { message?: string }).message || `Erro ${response.status}: ${response.statusText}`);
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error((errorData as { message?: string }).message || `Erro ${response.status}: ${response.statusText}`);
    }

    const parsedResponse = await response.json().catch(() => ({}));
    return {
      ...(parsedResponse as { message?: string }),
      message: (parsedResponse as { message?: string }).message || 'Perfil atualizado com sucesso!',
      ...(photoSkipped ? { photoSkipped: true } : {})
    };
  }
}

export const userService = new UserService();
