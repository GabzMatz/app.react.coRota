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
  private baseURL = 'http://localhost:3000';

  // Buscar empresas por nome
  async searchCompanies(searchTerm: string): Promise<Company[]> {
    try {
      if (!searchTerm.trim()) {
        return [];
      }

      console.log('🔍 Buscando empresas com termo:', searchTerm);

      const response = await fetch(`${this.baseURL}/companies/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: searchTerm }),
      });

      console.log('📡 Resposta da API:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro na API:', errorData);
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const data: CompanySearchResponse = await response.json();
      console.log('✅ Empresas encontradas:', data.data);
      
      return data.data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar empresas:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  }
}

export const companyService = new CompanyService();
