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
  const [fieldValidations, setFieldValidations] = useState<Record<string, { isValid: boolean; message: string }>>({});
  const [currentEmail, setCurrentEmail] = useState<string>('');

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setEmpresaValue(company.name);
    // Revalidar email quando empresa mudar
    if (currentEmail) {
      validateEmail(currentEmail);
    }
  };

  const handleCompanyChange = (value: string) => {
    setEmpresaValue(value);
    if (!value) {
      setSelectedCompany(null);
      // Revalidar email se houver um email digitado (vai mostrar erro de empresa não selecionada)
      if (currentEmail) {
        validateEmail(currentEmail);
      } else {
        // Limpar validação de email se não houver email digitado
        setFieldValidations(prev => {
          const newValidations = { ...prev };
          delete newValidations.email;
          return newValidations;
        });
      }
    }
  };

  // Função para validar email contra o array de emails da empresa
  const validateEmail = (email: string) => {
    if (!email) {
      setFieldValidations(prev => {
        const newValidations = { ...prev };
        delete newValidations.email;
        return newValidations;
      });
      return;
    }

    if (!selectedCompany) {
      setFieldValidations(prev => ({
        ...prev,
        email: {
          isValid: false,
          message: 'selecione uma empresa primeiro'
        }
      }));
      return;
    }

    const emailLower = email.toLowerCase().trim();
    const isValid = selectedCompany.usersEmails.some(
      allowedEmail => allowedEmail.toLowerCase().trim() === emailLower
    );

    setFieldValidations(prev => ({
      ...prev,
      email: {
        isValid,
        message: isValid ? 'email válido' : 'email não autorizado pela empresa'
      }
    }));
  };

  // Função para atualizar validações quando os dados mudarem
  const handleInputChange = (data: Record<string, string>) => {
    if (data.email !== undefined) {
      setCurrentEmail(data.email);
      validateEmail(data.email);
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
    
    // Validar email antes de avançar
    if (!selectedCompany) {
      setFieldValidations(prev => ({
        ...prev,
        email: {
          isValid: false,
          message: 'selecione uma empresa primeiro'
        }
      }));
      return;
    }

    const emailLower = data.email?.toLowerCase().trim();
    const isEmailValid = selectedCompany.usersEmails.some(
      allowedEmail => allowedEmail.toLowerCase().trim() === emailLower
    );

    if (!isEmailValid) {
      setFieldValidations(prev => ({
        ...prev,
        email: {
          isValid: false,
          message: 'email não autorizado pela empresa'
        }
      }));
      return;
    }
    
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
      externalFieldValues={{
        empresa: empresaValue
      }}
      fieldValidations={fieldValidations}
      onInputChange={handleInputChange}
    />
  );
};

export default RegisterPage;
