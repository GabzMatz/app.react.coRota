import React, { useState } from 'react';
import AuthCard, { type AuthField } from '../components/AuthCard';
import CompanyAutocomplete from '../components/CompanyAutocomplete';
import { useRegister } from '../contexts/RegisterContext';
import { type Company } from '../services/companyService';

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onLoginClick: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess, onLoginClick }) => {
  const { updateRegisterData } = useRegister();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [empresaValue, setEmpresaValue] = useState('');
  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setEmpresaValue(company.name);
  };

  const handleCompanyChange = (value: string) => {
    setEmpresaValue(value);
    if (!value) {
      setSelectedCompany(null);
    }
  };

  const registerFields: AuthField[] = [
    {
      name: 'empresa',
      label: 'Empresa',
      type: 'text',
      placeholder: 'Digite o nome da empresa',
      required: true,
      customComponent: (
        <CompanyAutocomplete
          value={empresaValue}
          onChange={handleCompanyChange}
          onSelect={handleCompanySelect}
          placeholder="Digite o nome da empresa"
          required={true}
        />
      )
    },
    {
      name: 'cpf',
      label: 'CPF',
      type: 'text',
      placeholder: '000.000.000-00',
      required: true
    },
    {
      name: 'email',
      label: 'Email Corporativo',
      type: 'email',
      placeholder: 'seu.email@empresa.com',
      required: true
    }
  ];

  const handleRegister = (data: Record<string, string>) => {
    console.log('Dados do registro passo 1:', data);
    console.log('Empresa selecionada:', selectedCompany);
    
    // Salvar dados do primeiro passo
    updateRegisterData('step1', {
      empresa: empresaValue,
      cpf: data.cpf,
      email: data.email,
      selectedCompany: selectedCompany
    });
    onRegisterSuccess();
  };

  return (
    <AuthCard
      fields={registerFields}
      buttonText="Próximo"
      linkText="Possuo cadastro>"
      onSubmit={handleRegister}
      onLinkClick={onLoginClick}
    />
  );
};

export default RegisterPage;
