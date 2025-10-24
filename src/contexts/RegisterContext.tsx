import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface RegisterData {
  // Passo 1 - Dados da empresa
  empresa: string;
  cpf: string;
  email: string;
  
  // Passo 2 - Dados pessoais
  nomeCompleto: string;
  telefone: string;
  possuiCarro: string;
  dadosCarro: string;
  nomeUsuario: string;
  senha: string;
  confirmarSenha: string;
  
  // Passo 3 - Dados de endereço
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento: string;
}

interface RegisterContextType {
  registerData: RegisterData;
  updateRegisterData: (step: 'step1' | 'step2' | 'step3', data: Partial<RegisterData>) => void;
  clearRegisterData: () => void;
  getCompleteData: () => RegisterData;
}

const RegisterContext = createContext<RegisterContextType | undefined>(undefined);

const initialData: RegisterData = {
  // Passo 1
  empresa: '',
  cpf: '',
  email: '',
  
  // Passo 2
  nomeCompleto: '',
  telefone: '',
  possuiCarro: '',
  dadosCarro: '',
  nomeUsuario: '',
  senha: '',
  confirmarSenha: '',
  
  // Passo 3
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

  const updateRegisterData = (step: 'step1' | 'step2' | 'step3', data: Partial<RegisterData>) => {
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
