export interface LoginRequest {
  corporateEmail: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: string;
  email: string;
}

export interface AuthError {
  message: string;
  status?: number;
}

class AuthService {
  private baseURL = 'https://us-central1-corota-fe133.cloudfunctions.net/api';
  private tokenTimestampKey = 'authTokenIssuedAt';
  private tokenValidityMs = 60 * 60 * 1000;

  // Salvar token no localStorage
  setToken(token: string): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem(this.tokenTimestampKey, Date.now().toString());
  }

  // Obter token do localStorage
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Remover token do localStorage
  removeToken(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem(this.tokenTimestampKey);
  }

  private getTokenIssuedAt(): number | null {
    const stored = localStorage.getItem(this.tokenTimestampKey);
    if (!stored) {
      return null;
    }

    const parsed = Number(stored);
    if (!Number.isFinite(parsed)) {
      return null;
    }

    return parsed;
  }

  getTokenExpiryTime(): number | null {
    const issuedAt = this.getTokenIssuedAt();
    if (!issuedAt) {
      return null;
    }

    return issuedAt + this.tokenValidityMs;
  }

  isTokenExpired(): boolean {
    const expiry = this.getTokenExpiryTime();
    if (!expiry) {
      return true;
    }

    return Date.now() >= expiry;
  }

  // Verificar se usuário está autenticado
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    if (this.isTokenExpired()) {
      this.logout();
      return false;
    }

    return true;
  }

  // Fazer login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const data: LoginResponse = await response.json();
      
      // Salvar token automaticamente
      if (data.token) {
        this.setToken(data.token);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  }

  // Fazer logout
  logout(): void {
    this.removeToken();
  }

  // Obter headers com token para requisições autenticadas
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }
}

export const authService = new AuthService();
