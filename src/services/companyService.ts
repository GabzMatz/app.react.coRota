export interface CompanySearchRequest {
  name: string;
}

export interface Company {
  id: string;
  name: string;
  addressId: string;
  usersEmails: string[];
  isActive: boolean;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface CompanySearchResponse {
  data: Company[];
}

export interface CompanyError {
  message: string;
  status?: number;
}

class CompanyService {
  private baseURL = 'https://us-central1-corota-fe133.cloudfunctions.net/api';
  
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async searchCompanies(searchTerm: string): Promise<Company[]> {
    try {
      if (!searchTerm.trim()) {
        return [];
      }

      const response = await fetch(`${this.baseURL}/companies/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: searchTerm }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const data: CompanySearchResponse = await response.json();
      
      return data.data || [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  }

  async getCompanyById(companyId: string): Promise<Company> {
    try {
      const response = await fetch(`${this.baseURL}/companies/${companyId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const data: Company = await response.json();
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  }
}

export const companyService = new CompanyService();
