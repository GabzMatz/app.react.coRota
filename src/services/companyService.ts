export interface CompanySearchRequest {
  name: string;
}

export interface Company {
  id: string;
  name: string;
  // Adicione outros campos conforme necessário
}

export interface CompanySearchResponse {
  companies: Company[];
  total: number;
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
      return data.companies || [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  }
}

export const companyService = new CompanyService();
