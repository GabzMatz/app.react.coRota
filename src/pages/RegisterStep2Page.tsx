import React, { useState } from 'react';
import AuthCard, { type AuthField } from '../components/AuthCard';
import { useRegister } from '../contexts/RegisterContext';

interface RegisterStep2PageProps {
  onNext: () => void;
  onBack: () => void;
}

const RegisterStep2Page: React.FC<RegisterStep2PageProps> = ({ onNext, onBack }) => {
  const { updateRegisterData } = useRegister();
  const initialFormData = {
    nomeCompleto: '',
    telefone: '',
    possuiCarro: '',
    dadosCarro: '',
    nomeUsuario: '',
    senha: '',
    confirmarSenha: ''
  };

  const [fieldValidations, setFieldValidations] = useState<Record<string, { isValid: boolean; message: string }>>({});

  // Função para atualizar validações baseada nos dados do formulário
  const updateValidations = (data: Record<string, string>) => {
    const newValidations: Record<string, { isValid: boolean; message: string }> = {};

    // Validação do nome de usuário
    if (data.nomeUsuario) {
      if (data.nomeUsuario.length >= 3) {
        newValidations.nomeUsuario = { isValid: true, message: 'disponível' };
      } else {
        newValidations.nomeUsuario = { isValid: false, message: 'mínimo 3 caracteres' };
      }
    }

    // Validação de senhas
    if (data.senha && data.confirmarSenha) {
      const isValid = data.senha === data.confirmarSenha && data.confirmarSenha.length > 0;
      newValidations.confirmarSenha = { 
        isValid, 
        message: isValid ? 'as senhas são iguais' : 'as senhas não coincidem' 
      };
    }

    setFieldValidations(newValidations);
  };

  // Função para limpar dados do carro quando selecionar "Não"
  const handleInputChangeWithCarLogic = (data: Record<string, string>) => {
    // Se selecionou "Não" para ter carro, limpa os dados do carro
    if (data.possuiCarro === 'Não') {
      data.dadosCarro = '';
    }
    
    updateValidations(data);
  };

  const handleSubmit = (data: Record<string, string>) => {
    console.log('Dados do registro passo 2:', data);
    // Salvar dados do segundo passo
    updateRegisterData('step2', {
      nomeCompleto: data.nomeCompleto,
      telefone: data.telefone,
      possuiCarro: data.possuiCarro,
      dadosCarro: data.dadosCarro,
      nomeUsuario: data.nomeUsuario,
      senha: data.senha,
      confirmarSenha: data.confirmarSenha
    });
    onNext();
  };

  // Estado para controlar se o campo dados do carro está desabilitado
  const [isCarDataDisabled, setIsCarDataDisabled] = useState(false);

  // Função para atualizar campos baseada na seleção de carro
  const updateFieldsBasedOnCar = (data: Record<string, string>) => {
    const hasCar = data.possuiCarro === 'Sim';
    setIsCarDataDisabled(!hasCar);
    
    // Se não tem carro, limpa os dados do carro
    if (!hasCar) {
      data.dadosCarro = '';
    }
    
    handleInputChangeWithCarLogic(data);
  };

  const registerFields: AuthField[] = [
    {
      name: 'nomeCompleto',
      label: 'Nome completo',
      type: 'text',
      placeholder: 'Digite seu nome completo',
      required: true
    },
    {
      name: 'telefone',
      label: 'Telefone',
      type: 'tel',
      placeholder: '(00) 00000-0000',
      required: true
    },
    {
      name: 'possuiCarro',
      label: 'Possuí Carro?',
      type: 'checkbox',
      placeholder: '',
      required: true
    },
    {
      name: 'dadosCarro',
      label: 'Dados do Carro (Modelo, cor, placa)',
      type: 'text',
      placeholder: isCarDataDisabled ? 'Campo desabilitado' : 'Ex: Chevrolet Onix Prata, ABC-1234',
      required: false,
      disabled: isCarDataDisabled
    },
    {
      name: 'nomeUsuario',
      label: 'Nome de usuário',
      type: 'text',
      placeholder: '@seunome',
      required: true
    },
    {
      name: 'senha',
      label: 'Criar senha',
      type: 'password',
      placeholder: 'Digite sua senha',
      required: true
    },
    {
      name: 'confirmarSenha',
      label: 'Confirmar senha',
      type: 'password',
      placeholder: 'Confirme sua senha',
      required: true
    }
  ];

  return (
    <AuthCard
      fields={registerFields}
      buttonText="Próximo"
      linkText=""
      onSubmit={handleSubmit}
      onLinkClick={() => {}}
      initialData={initialFormData}
      showBackButton={true}
      onBackClick={onBack}
      fieldValidations={fieldValidations}
      onInputChange={updateFieldsBasedOnCar}
      showLogo={false}
    />
  );
};

export default RegisterStep2Page;
