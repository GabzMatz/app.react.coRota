import React, { useState, useEffect, useRef } from 'react';
import { companyService, type Company } from '../services/companyService';

interface CompanyAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (company: Company) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const CompanyAutocomplete: React.FC<CompanyAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Digite o nome da empresa',
  required = false,
  disabled = false
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value.trim() && value.length >= 3) {
        searchCompanies(value);
      } else {
        setCompanies([]);
        setShowDropdown(false);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchCompanies = async (searchTerm: string) => {
    setIsLoading(true);
    setError('');

    try {
      console.log('🔍 Iniciando busca por empresas...');
      const results = await companyService.searchCompanies(searchTerm);
      console.log('📋 Resultados recebidos:', results);
      
      setCompanies(results);
      setShowDropdown(results.length > 0);
      
      if (results.length === 0 && searchTerm.length >= 2) {
        console.log('ℹ️ Nenhuma empresa encontrada para:', searchTerm);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar empresas:', error);
      setError(error instanceof Error ? error.message : 'Erro ao buscar empresas');
      setCompanies([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowDropdown(true);
  };

  const handleCompanySelect = (company: Company) => {
    onChange(company.name);
    onSelect(company);
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowDropdown(companies.length > 0)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full py-3 border-0 border-b-2 bg-transparent text-base outline-none transition-colors placeholder-gray-400 ${
          disabled 
            ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
            : 'border-gray-300 text-gray-600 focus:border-blue-500'
        }`}
      />
      
      
      {isLoading && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}

      
      {error && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-100 border border-red-300 rounded text-red-600 text-xs">
          {error}
        </div>
      )}

      
      {showDropdown && companies.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
            {companies.length} empresa{companies.length !== 1 ? 's' : ''} encontrada{companies.length !== 1 ? 's' : ''}
          </div>
          {companies.map((company) => (
            <div
              key={company.id}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
              onClick={() => handleCompanySelect(company)}
            >
              <div className="font-medium text-gray-900">{company.name}</div>
              <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  company.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {company.isActive ? 'Ativa' : 'Inativa'}
                </span>
                <span>{company.usersEmails.length} usuário{company.usersEmails.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      
      {showDropdown && !isLoading && companies.length === 0 && value.length >= 3 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="px-4 py-3 text-gray-500 text-sm text-center">
            <div className="mb-1">🔍</div>
            <div>Nenhuma empresa encontrada</div>
            <div className="text-xs mt-1">Tente outro termo de busca</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyAutocomplete;
