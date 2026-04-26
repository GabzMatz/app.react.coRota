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
    marcaCarro: '',
    modeloCarro: '',
    placaCarro: '',
    corCarro: '',
    assentosCarro: '',
    nomeUsuario: '',
    senha: '',
    confirmarSenha: ''
  };

  const [fieldValidations, setFieldValidations] = useState<Record<string, { isValid: boolean; message: string }>>({});

  const updateValidations = (data: Record<string, string>) => {
    const newValidations: Record<string, { isValid: boolean; message: string }> = {};

    if (data.nomeUsuario) {
      if (data.nomeUsuario.length >= 3) {
        newValidations.nomeUsuario = { isValid: true, message: 'disponível' };
      } else {
        newValidations.nomeUsuario = { isValid: false, message: 'mínimo 3 caracteres' };
      }
    }

    if (data.senha && data.confirmarSenha) {
      const isValid = data.senha === data.confirmarSenha && data.confirmarSenha.length > 0;
      newValidations.confirmarSenha = { 
        isValid, 
        message: isValid ? 'as senhas são iguais' : 'as senhas não coincidem' 
      };
    }

    setFieldValidations(newValidations);
  };

  const handleInputChangeWithCarLogic = (data: Record<string, string>) => {
    if (data.possuiCarro === 'Não') {
      data.marcaCarro = '';
      data.modeloCarro = '';
      data.placaCarro = '';
      data.corCarro = '';
      data.assentosCarro = '';
    }
    
    updateValidations(data);
  };

  const handleSubmit = (data: Record<string, string>) => {
    console.log('Dados do registro passo 2:', data);
    updateRegisterData('step2', {
      nomeCompleto: data.nomeCompleto,
      telefone: data.telefone,
      possuiCarro: data.possuiCarro,
      marcaCarro: data.marcaCarro,
      modeloCarro: data.modeloCarro,
      placaCarro: data.placaCarro,
      corCarro: data.corCarro,
      assentosCarro: data.assentosCarro,
      nomeUsuario: data.nomeUsuario,
      senha: data.senha,
      confirmarSenha: data.confirmarSenha
    });
    onNext();
  };

  const [isCarDataDisabled, setIsCarDataDisabled] = useState(false);

  const updateFieldsBasedOnCar = (data: Record<string, string>) => {
    const hasCar = data.possuiCarro === 'Sim';
    setIsCarDataDisabled(!hasCar);
    
    if (!hasCar) {
      data.marcaCarro = '';
      data.modeloCarro = '';
      data.placaCarro = '';
      data.corCarro = '';
      data.assentosCarro = '';
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
      name: 'marcaCarro',
      label: 'Marca do veículo',
      type: 'text',
      placeholder: isCarDataDisabled ? 'Campo desabilitado' : 'Ex: Chevrolet',
      required: false,
      disabled: isCarDataDisabled
    },
    {
      name: 'modeloCarro',
      label: 'Modelo do veículo',
      type: 'text',
      placeholder: isCarDataDisabled ? 'Campo desabilitado' : 'Ex: Onix',
      required: false,
      disabled: isCarDataDisabled
    },
    {
      name: 'placaCarro',
      label: 'Placa do veículo',
      type: 'text',
      placeholder: isCarDataDisabled ? 'Campo desabilitado' : 'Ex: ABC1D23',
      required: false,
      disabled: isCarDataDisabled
    },
    {
      name: 'corCarro',
      label: 'Cor do veículo',
      type: 'text',
      placeholder: isCarDataDisabled ? 'Campo desabilitado' : 'Ex: Prata',
      required: false,
      disabled: isCarDataDisabled
    },
    {
      name: 'assentosCarro',
      label: 'Quantidade de assentos',
      type: 'number',
      placeholder: isCarDataDisabled ? 'Campo desabilitado' : 'Ex: 5',
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
