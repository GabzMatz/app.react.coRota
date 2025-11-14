import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { AddressCreateResponse } from '../services/addressService';
import type { UserRegisterResponse } from '../services/userService';
import type { Company } from '../services/companyService';

export interface RegisterData {
  empresa: string;
  cpf: string;
  email: string;
  nomeCompleto: string;
  telefone: string;
  possuiCarro: string;
  dadosCarro: string;
  nomeUsuario: string;
  senha: string;
  confirmarSenha: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento: string;
  createdAddress?: AddressCreateResponse;
  createdUser?: UserRegisterResponse;
  selectedCompany?: Company;
}

interface RegisterContextType {
  registerData: RegisterData;
  updateRegisterData: (step: 'step1' | 'step2' | 'step3', data: Partial<RegisterData>) => void;
  clearRegisterData: () => void;
  getCompleteData: () => RegisterData;
}

const RegisterContext = createContext<RegisterContextType | undefined>(undefined);

const initialData: RegisterData = {
  empresa: '',
  cpf: '',
  email: '',
  nomeCompleto: '',
  telefone: '',
  possuiCarro: '',
  dadosCarro: '',
  nomeUsuario: '',
  senha: '',
  confirmarSenha: '',
  cep: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  complemento: ''
};

export const RegisterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [registerData, setRegisterData] = useState<RegisterData>(initialData);

  const updateRegisterData = (_step: 'step1' | 'step2' | 'step3', data: Partial<RegisterData>) => {
    setRegisterData(prev => ({
      ...prev,
      ...data
    }));
  };

  const clearRegisterData = () => {
    setRegisterData(initialData);
  };

  const getCompleteData = () => {
    return registerData;
  };

  return (
    <RegisterContext.Provider value={{
      registerData,
      updateRegisterData,
      clearRegisterData,
      getCompleteData
    }}>
      {children}
    </RegisterContext.Provider>
  );
};

export const useRegister = () => {
  const context = useContext(RegisterContext);
  if (context === undefined) {
    throw new Error('useRegister must be used within a RegisterProvider');
  }
  return context;
};
